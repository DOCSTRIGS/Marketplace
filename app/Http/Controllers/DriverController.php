<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Traits\NotifiesSafely;

class DriverController extends Controller
{
    use NotifiesSafely;

    public function dashboard()
    {
        (new \App\Services\DeliveryAssignmentService())->resetExpiredPauses();

        $driver = auth()->user();

        $reviewStats = Review::where('type', 'driver')->where('driver_id', $driver->id)
            ->selectRaw('COUNT(*) as cnt, AVG(rating) as avg_rating')
            ->first();
        $reviewsCount = (int) $reviewStats->cnt;
        $avgRating = round($reviewsCount > 0 ? $reviewStats->avg_rating : 5, 1);

        // Stats pour le nouveau design
        $stats = [
            'earnings_today' => 24500,
            'primes_today' => 1200,
            'rating' => $avgRating,
            'reviews_count' => $reviewsCount,
            'acceptance_rate' => 98,
            'punctuality' => 100,
            'challenges' => [
                'goal' => 10,
                'current' => 8,
                'badges' => ['trophy', 'bolt', 'lock']
            ],
            'vehicle' => [
                'name' => $driver->vehicle_model ?? 'Moto (Haoussa 150)',
                'expiry' => '45j'
            ]
        ];

        // 1. Commandes disponibles (en attente de livreur)
        $availableOrders = Order::whereIn('status', ['pending', 'preparing'])
            ->whereNull('driver_id')
            ->with(['shop', 'user'])
            ->latest()
            ->take(10)
            ->get();

        // 2. Commandes en cours pour ce livreur
        $activeOrders = Order::where('driver_id', $driver->id)
            ->whereIn('status', ['accepted', 'preparing', 'shipped'])
            ->with(['shop', 'user', 'orderItems.product'])
            ->get();

        // 3. Historique récent (livré)
        $history = Order::where('driver_id', $driver->id)
            ->where('status', 'delivered')
            ->with(['shop', 'user'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Driver/Dashboard', [
            'availableOrders' => $availableOrders,
            'activeOrders' => $activeOrders,
            'history' => $history,
            'stats' => $stats
        ]);
    }

    public function history()
    {
        $driver = auth()->user();
        $orders = Order::where('driver_id', $driver->id)
            ->where('status', 'delivered')
            ->with(['shop', 'user', 'orderItems.product'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Driver/History', [
            'orders' => $orders
        ]);
    }


    public function show(Order $order)
    {
        // Un livreur ne peut consulter que ses propres livraisons, ou une commande
        // pas encore attribuée (cas du lien "Lien Livreur" partagé par le vendeur,
        // que le livreur ouvre avant d'accepter formellement la mission).
        if ($order->driver_id !== null && $order->driver_id !== auth()->id()) {
            abort(403, 'Cette commande a déjà été prise en charge par un autre livreur.');
        }

        return Inertia::render('Driver/Tracking', [
            'order' => $order->load(['shop', 'user', 'orderItems.product'])
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $user = auth()->user();
        
        // 1. Update permanent location in DB (for Admin Fleet View)
        $user->update([
            'last_latitude' => $request->latitude,
            'last_longitude' => $request->longitude,
            'last_location_update' => now(),
        ]);

        // 2. Broadcast for Admin (Global Fleet Channel)
        $this->safely(
            fn() => broadcast(new \App\Events\DriverLocationUpdated(
                null, // No specific order needed for global fleet
                $request->latitude,
                $request->longitude,
                $user->id,
                $user->driver_status
            ))->toOthers(),
            'DriverController@updateLocation: fleet broadcast failed',
            ['user_id' => $user->id]
        );

        // 3. Broadcast for Client/Seller (Specific Order Channel)
        if ($request->order_id) {
            $this->safely(
                fn() => broadcast(new \App\Events\DriverLocationUpdated(
                    $request->order_id,
                    $request->latitude,
                    $request->longitude,
                    $user->id,
                    $user->driver_status
                ))->toOthers(),
                'DriverController@updateLocation: order broadcast failed',
                ['user_id' => $user->id, 'order_id' => $request->order_id]
            );
        }

        return response()->json(['status' => 'success', 'lat' => $request->latitude, 'lng' => $request->longitude]);
    }

    public function syncPositions(Request $request)
    {
        $request->validate([
            'positions' => 'required|array',
            'positions.*.latitude' => 'required|numeric',
            'positions.*.longitude' => 'required|numeric',
            'positions.*.order_id' => 'required|exists:orders,id',
        ]);

        $user = auth()->user();
        $latest = end($request->positions);

        // Update permanent location with the latest one
        $user->update([
            'last_latitude' => $latest['latitude'],
            'last_longitude' => $latest['longitude'],
            'last_location_update' => now(),
        ]);

        // Broadcast the latest position to keep tracking updated
        $this->safely(
            fn() => broadcast(new \App\Events\DriverLocationUpdated(
                $latest['order_id'],
                $latest['latitude'],
                $latest['longitude'],
                $user->id,
                $user->driver_status
            ))->toOthers(),
            'DriverController@syncPositions: broadcast failed',
            ['user_id' => $user->id, 'order_id' => $latest['order_id']]
        );

        return response()->json(['status' => 'success', 'synced' => count($request->positions)]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        // 1. Security Check: Only the assigned driver can update status
        if ($order->driver_id !== auth()->id()) {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:shipped,delivered',
            'delivery_code' => 'nullable|string'
        ]);

        $oldStatus = $order->status;
        $updateData = ['status' => $validated['status']];

        // 2. Strict OTP Check for delivery completion
        if ($validated['status'] === 'delivered') {
            if (!$validated['delivery_code'] || $validated['delivery_code'] != $order->delivery_code) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Code de livraison invalide. La livraison ne peut pas être confirmée sans le code du client.'
                ], 422);
            }

            // Record transaction for seller
            \App\Models\Transaction::create([
                'user_id' => $order->shop->user_id,
                'order_id' => $order->id,
                'amount' => $order->seller_amount,
                'type' => 'credit',
                'description' => "Vente - Commande #{$order->order_number}",
                'status' => 'completed'
            ]);
        }

        // Log Picked Up time
        if ($validated['status'] === 'shipped' && $oldStatus !== 'shipped') {
            $updateData['picked_up_at'] = now();
        }

        // Log Delivered time
        if ($validated['status'] === 'delivered' && $oldStatus !== 'delivered') {
            $updateData['delivered_at'] = now();
            
            // Increment shop balance (Crucial: was missing here!)
            $order->shop->increment('balance', $order->seller_amount);

            // Increment driver stats
            $order->driver->increment('deliveries_completed');
            
            // Mark driver as available again
            $order->driver->update(['driver_status' => 'available']);
        }

        $order->update($updateData);

        // Broadcast status update
        $this->safely(
            fn() => event(new \App\Events\OrderUpdated($order)),
            'DriverController@updateStatus: broadcast failed',
            ['order_id' => $order->id]
        );

        // Send Notifications (each independent: one failing must not skip the others)
        if ($order->status === 'shipped') {
            $this->safely(
                fn() => $order->user->notify(new \App\Notifications\OrderNotification(
                    $order,
                    "Votre commande #{$order->order_number} est en route !",
                    'info'
                )),
                'DriverController@updateStatus: client notification failed',
                ['order_id' => $order->id]
            );
        } elseif ($order->status === 'delivered') {
            $this->safely(
                fn() => $order->shop->user->notify(new \App\Notifications\OrderNotification(
                    $order,
                    "La commande #{$order->order_number} a été livrée avec succès.",
                    'success'
                )),
                'DriverController@updateStatus: seller notification failed',
                ['order_id' => $order->id]
            );
            $this->safely(
                fn() => $order->user->notify(new \App\Notifications\OrderNotification(
                    $order,
                    "Merci ! Votre commande #{$order->order_number} a été livrée avec succès (OTP: {$order->delivery_code}).",
                    'success'
                )),
                'DriverController@updateStatus: client notification failed',
                ['order_id' => $order->id]
            );
        }

        return response()->json(['success' => true]);
    }

    public function profile()
    {
        $driver = auth()->user();

        $reviewStats = Review::where('type', 'driver')->where('driver_id', $driver->id)
            ->selectRaw('COUNT(*) as cnt, AVG(rating) as avg_rating')
            ->first();
        $reviewsCount = (int) $reviewStats->cnt;

        return Inertia::render('Driver/Profile', [
            'user' => $driver,
            'reviews' => Review::where('type', 'driver')->where('driver_id', $driver->id)
                ->with('user:id,name')->latest()->take(10)->get(),
            'avgRating' => round($reviewsCount > 0 ? $reviewStats->avg_rating : 0, 1),
            'reviewsCount' => $reviewsCount,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'vehicle_type' => 'nullable|string',
            'vehicle_model' => 'nullable|string',
            'vehicle_plate' => 'nullable|string',
            'vehicle_description' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
            'vehicle_image' => 'nullable|image|max:2048',
            'license_image' => 'nullable|image|max:2048',
            'insurance_image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('vehicle_image')) {
            $validated['vehicle_image'] = $request->file('vehicle_image')->store('drivers/vehicles', 's3');
        }

        if ($request->hasFile('license_image')) {
            $validated['license_image'] = $request->file('license_image')->store('drivers/documents', 's3');
        }

        if ($request->hasFile('insurance_image')) {
            $validated['insurance_image'] = $request->file('insurance_image')->store('drivers/documents', 's3');
        }

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    public function acceptOrder(Order $order)
    {
        // Vérifier si la commande est toujours disponible
        if ($order->driver_id) {
            return back()->with('error', 'Cette commande a déjà été prise par un autre livreur.');
        }

        $order->update([
            'driver_id' => auth()->id(),
            'status' => 'accepted'
        ]);

        // Notifications (each independent: one failing must not skip the other)
        $this->safely(
            fn() => $order->user->notify(new \App\Notifications\OrderNotification(
                $order,
                "Votre commande #{$order->order_number} est en préparation.",
                'info'
            )),
            'DriverController@acceptOrder: client notification failed',
            ['order_id' => $order->id]
        );

        $this->safely(
            fn() => $order->shop->user->notify(new \App\Notifications\OrderNotification(
                $order,
                "Un livreur est en route pour récupérer la commande #{$order->order_number}.",
                'success'
            )),
            'DriverController@acceptOrder: seller notification failed',
            ['order_id' => $order->id]
        );

        // Marquer le livreur comme occupé
        auth()->user()->update(['driver_status' => 'busy']);

        // Notifier les parties concernées
        $this->safely(
            fn() => event(new \App\Events\OrderUpdated($order)),
            'DriverController@acceptOrder: broadcast failed',
            ['order_id' => $order->id]
        );

        return back()->with('success', 'Mission acceptée ! En route pour la boutique.');
    }

    public function updateAvailability(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:available,offline',
        ]);

        $user = auth()->user();
        $user->update([
            'driver_status' => $validated['status']
        ]);

        // Broadcast to Admin (Fleet Channel)
        $this->safely(
            fn() => broadcast(new \App\Events\DriverLocationUpdated(
                null,
                $user->last_latitude,
                $user->last_longitude,
                $user->id,
                $user->driver_status
            ))->toOthers(),
            'DriverController@updateAvailability: broadcast failed',
            ['user_id' => $user->id]
        );

        return response()->json(['success' => true, 'status' => $validated['status']]);
    }
}
