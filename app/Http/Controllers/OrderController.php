<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'required|string',
        ]);

        $itemsByShop = [];
        foreach ($validated['items'] as $itemData) {
            $product = Product::findOrFail($itemData['id']);
            $itemsByShop[$product->shop_id][] = [
                'product' => $product,
                'quantity' => $itemData['quantity']
            ];
        }

        $paymentReference = 'PAY-' . strtoupper(Str::random(12));
        $createdOrders = [];

        foreach ($itemsByShop as $shopId => $items) {
            $totalAmount = 0;
            foreach ($items as $item) {
                $totalAmount += $item['product']->price * $item['quantity'];
            }

            $order = Order::create([
                'user_id' => Auth::id(),
                'shop_id' => $shopId,
                'order_number' => 'CMD-' . strtoupper(Str::random(8)),
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'delivery_address' => $validated['delivery_address'],
                'payment_method' => 'Flooz/T-Money',
                'payment_reference' => $paymentReference,
            ]);

            foreach ($items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['product']->price,
                ]);
            }
            $createdOrders[] = $order;
        }

        return redirect()->route('checkout.show', ['reference' => $paymentReference]);
    }

    /**
     * Display seller orders.
     */
    public function sellerOrders()
    {
        $user = Auth::user();
        $shop = $user->shop;
        
        if (!$shop) return redirect()->route('shops.create');

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
            'status' => 'required|string|in:pending,paid,preparing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        
        // Security check: only the shop owner can update the status
        $shop = Auth::user()->shop;
        if (!$shop || $order->shop_id !== $shop->id) {
            abort(403);
        }

        $order->update(['status' => $validated['status']]);

        return back()->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * Display user orders history.
     */
    public function userOrders()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['orderItems.product', 'shop'])
            ->latest()
            ->get();

        return Inertia::render('MyOrders', [
            'orders' => $orders
        ]);
    }
}
