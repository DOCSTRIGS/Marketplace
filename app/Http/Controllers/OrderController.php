<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $totalAmount = $product->price * $validated['quantity'];

        $order = Order::create([
            'user_id' => auth()->id() ?? 1, // Fallback for demo if not logged in
            'shop_id' => $product->shop_id,
            'order_number' => 'CMD-' . strtoupper(Str::random(8)),
            'total_amount' => $totalAmount,
            'status' => 'En préparation',
            'delivery_address' => $validated['delivery_address'],
            'payment_method' => 'Cash',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $validated['quantity'],
            'price' => $product->price,
        ]);

        return redirect()->route('tracking', ['order_id' => $order->id])->with('success', 'Commande passée avec succès !');
    }

    /**
     * Display seller orders.
     */
    public function sellerOrders()
    {
        // Fallback for Demo/Testing without authentication
        $user = auth()->user();
        if (!$user) {
            $shop = \App\Models\Shop::first();
        } else {
            $shop = $user->shops()->first();
        }
        
        if (!$shop) return redirect()->route('seller.dashboard');

        $orders = Order::where('shop_id', $shop->id)
            ->with(['orderItems.product', 'user'])
            ->latest()
            ->get();

        return Inertia::render('Seller/Orders', [
            'orders' => $orders
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:En préparation,Expédié,Livré,Annulé',
        ]);

        $order = Order::findOrFail($id);
        
        // Security check: only the shop owner can update the status
        $shop = auth()->user()->shops()->first();
        if ($order->shop_id !== $shop->id) {
            abort(403);
        }

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Statut mis à jour avec succès.');
    }
}
