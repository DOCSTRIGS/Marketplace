<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class DeliveryAssignmentService
{
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

            // Optimization: Ignore drivers further than 15km
            if ($distance > 15) continue;

            // Simple intelligence: we prefer the closest, but also those with high completed deliveries
            // Score = Distance (lower is better) - (Deliveries / 100) (higher is better)
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

        // 3. Assign the order if a driver was found
        if ($closestDriver) {
            $order->update([
                'driver_id' => $closestDriver->id,
                'status' => 'shipped' // Automatically mark as shipped/in delivery
            ]);

            // Mark driver as busy
            $closestDriver->update(['driver_status' => 'busy']);

            // Trigger Real-time Notification
            event(new \App\Events\OrderAssignedToDriver($order, $closestDriver->id));

            Log::info("Order #{$order->id} assigned to Driver #{$closestDriver->id} (Distance: {$minDistance}km)");
            return $closestDriver;
        }

        return null;
    }

    /**
     * Automatically reset drivers who have been on pause for more than 1 hour.
     */
    public function resetExpiredPauses()
    {
        $expiredTime = now()->subHour();
        
        $driversOnPause = User::where('role', 'driver')
            ->where('driver_status', 'pause')
            ->where('pause_started_at', '<=', $expiredTime)
            ->get();

        foreach ($driversOnPause as $driver) {
            $driver->update([
                'driver_status' => 'available',
                'pause_started_at' => null
            ]);
            Log::info("Driver #{$driver->id} pause expired. Status reset to available.");
        }
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
