<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderTrackingController extends Controller
{
    /**
     * Get the real-time position of the driver assigned to an order.
     */
    public function getDriverPosition(Order $order)
    {
        $order->loadMissing(['driver', 'shop']);

        // Security: Only the shop owner or the client who placed the order can track
        $user = Auth::user();
        
        $isSeller = $user->shop && $order->shop_id === $user->shop->id;
        $isClient = $order->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isSeller && !$isClient && !$isAdmin) {
            abort(403, "Vous n'avez pas l'autorisation de suivre cette commande.");
        }

        if (!$order->driver_id || !$order->driver) {
            return response()->json([
                'status' => 'searching',
                'message' => 'Recherche de livreur en cours...'
            ]);
        }

        return response()->json([
            'status' => 'active',
            'driver' => [
                'id' => $order->driver->id,
                'name' => $order->driver->name,
                'lat' => $order->driver->last_latitude,
                'lng' => $order->driver->last_longitude,
                'status' => $order->driver->driver_status,
            ],
            'shop' => [
                'name' => $order->shop->name,
                'lat' => $order->shop->latitude,
                'lng' => $order->shop->longitude,
            ],
            'order_status' => $order->status
        ]);
    }
}
