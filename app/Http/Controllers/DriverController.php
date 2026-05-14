<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function dashboard()
    {
        (new \App\Services\DeliveryAssignmentService())->resetExpiredPauses();

        $driver = auth()->user();
        
        // Stats pour le nouveau design
        $stats = [
            'earnings_today' => 24500, // Simulé pour le design
            'primes_today' => 1200,
            'rating' => 4.9,
            'acceptance_rate' => 98,
            'punctuality' => 100,
            'challenges' => [
                'goal' => 10,
                'current' => 8,
                'badges' => ['trophy', 'bolt', 'lock']
            ],
            'vehicle' => [
                'name' => 'Moto (Haoussa 150)',
                'expiry' => '45j'
            ]
        ];

        $activeOrders = Order::where('driver_id', $driver->id)
            ->whereIn('status', ['accepted', 'preparing', 'shipped'])
            ->with(['shop', 'user', 'orderItems.product'])
            ->get();

        return Inertia::render('Driver/Dashboard', [
            'activeOrders' => $activeOrders,
            'stats' => $stats
        ]);
    }

    public function earnings()
    {
        return Inertia::render('Driver/Earnings');
    }

    public function performance()
    {
        return Inertia::render('Driver/Performance');
    }


    public function show(Order $order)
    {
        return Inertia::render('Driver/Tracking', [
            'order' => $order->load(['shop', 'user', 'orderItems.product'])
        ]);
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        broadcast(new \App\Events\DriverLocationUpdated(
            $request->order_id,
            $request->latitude,
            $request->longitude,
            auth()->id()
        ))->toOthers();

        return response()->json(['status' => 'success']);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:shipped,delivered',
            'delivery_code' => 'required_if:status,delivered|nullable|string'
        ]);

        $oldStatus = $order->status;
        $updateData = ['status' => $validated['status']];

        // Validate Delivery Code for completion
        if ($validated['status'] === 'delivered') {
            if ($validated['delivery_code'] != $order->delivery_code) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Code de livraison incorrect. Veuillez demander le code au client.'
                ], 422);
            }
        }

        // Log Picked Up time
        if ($validated['status'] === 'shipped' && $oldStatus !== 'shipped') {
            $updateData['picked_up_at'] = now();
        }

        // Log Delivered time
        if ($validated['status'] === 'delivered' && $oldStatus !== 'delivered') {
            $updateData['delivered_at'] = now();
            
            // Increment driver stats
            $order->driver->increment('deliveries_completed');
            
            // Mark driver as available again
            $order->driver->update(['driver_status' => 'available']);
        }

        $order->update($updateData);

        // Broadcast status update
        event(new \App\Events\OrderUpdated($order));

        return response()->json(['success' => true]);
    }

    public function profile()
    {
        return Inertia::render('Driver/Profile', [
            'user' => auth()->user()
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
            $validated['vehicle_image'] = $request->file('vehicle_image')->store('drivers/vehicles', 'public');
        }
        
        if ($request->hasFile('license_image')) {
            $validated['license_image'] = $request->file('license_image')->store('drivers/documents', 'public');
        }

        if ($request->hasFile('insurance_image')) {
            $validated['insurance_image'] = $request->file('insurance_image')->store('drivers/documents', 'public');
        }

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }
}
