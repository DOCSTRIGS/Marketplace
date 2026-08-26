<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Traits\NotifiesSafely;
use Illuminate\Support\Facades\Log;

class DeliveryAssignmentService
{
    use NotifiesSafely;

    /**
     * Find the closest available driver to the shop location and assign them.
     */
    public function assignClosestDriver(Order $order)
    {
        $shop = $order->shop;
        if (!$shop || !$shop->latitude || !$shop->longitude) {
            Log::warning("Assignment failed: Shop coordinates missing for Order #{$order->id}");
            return null;
        }

        // 1. Get all online and available drivers
        $drivers = User::where('role', 'driver')
            ->where('driver_status', 'available')
            ->get();

        if ($drivers->isEmpty()) {
            Log::info("No available drivers for Order #{$order->id}");
            return null;
        }

        $candidates = [];

        // 2. Calculate score for each driver
        foreach ($drivers as $driver) {
            if (!$driver->last_latitude || !$driver->last_longitude) continue;

            $distance = $this->calculateDistance(
                $shop->latitude, 
                $shop->longitude, 
                $driver->last_latitude, 
                $driver->last_longitude
            );

            // Score = Distance (lower is better) - (Deliveries / 10) (higher is better)
            $score = $distance - ($driver->deliveries_completed / 10); 

            $candidates[] = [
                'driver' => $driver,
                'distance' => $distance,
                'score' => $score
            ];
        }

        // Sort by score ascending
        usort($candidates, fn($a, $b) => $a['score'] <=> $b['score']);

        $closestDriver = !empty($candidates) ? $candidates[0]['driver'] : null;
        $minDistance = !empty($candidates) ? $candidates[0]['distance'] : null;

        // Fallback: If no driver with GPS was found, just pick the first available driver
        if (!$closestDriver && !$drivers->isEmpty()) {
            $closestDriver = $drivers->first();
            Log::info("No GPS data found for drivers. Assigning Order #{$order->id} to first available Driver #{$closestDriver->id} as fallback.");
        }

        // 3. Notify the closest drivers (don't assign yet, wait for manual acceptance)
        foreach ($candidates as $candidate) {
            $this->safely(
                fn() => $candidate['driver']->notify(new \App\Notifications\OrderNotification(
                    $order,
                    "Une nouvelle mission est disponible près de vous : #{$order->order_number}",
                    'info'
                )),
                'DeliveryAssignmentService@assignClosestDriver: driver notification failed',
                ['order_id' => $order->id, 'driver_id' => $candidate['driver']->id]
            );
        }

        // Broadcast to all drivers in range
        $this->safely(
            fn() => event(new \App\Events\OrderUpdated($order)),
            'DeliveryAssignmentService@assignClosestDriver: broadcast failed',
            ['order_id' => $order->id]
        );

        return null; // Return null because we didn't assign yet
    }

    /**
     * Automatically reset drivers who have been on pause for more than 1 hour.
     * Runs on every driver dashboard load, so this stays a single bulk UPDATE
     * (no per-driver SELECT + loop) to keep that hot path cheap.
     */
    public function resetExpiredPauses()
    {
        User::where('role', 'driver')
            ->where('driver_status', 'pause')
            ->where('pause_started_at', '<=', now()->subHour())
            ->update([
                'driver_status' => 'available',
                'pause_started_at' => null,
            ]);
    }

    /**
     * Haversine Formula to calculate distance between two coordinates in km
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
}
