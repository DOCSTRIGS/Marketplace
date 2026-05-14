<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlacedSeller;
use App\Mail\OrderConfirmedClient;

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

            $commissionAmount = $totalAmount * 0.10;
            $sellerAmount = $totalAmount - $commissionAmount;

            $order = Order::create([
                'user_id' => Auth::id(),
                'shop_id' => $shopId,
                'order_number' => 'CMD-' . strtoupper(Str::random(8)),
                'total_amount' => $totalAmount,
                'commission_amount' => $commissionAmount,
                'seller_amount' => $sellerAmount,
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
            // Send Email to Seller
            try {
                Mail::to($order->shop->user->email)->send(new OrderPlacedSeller($order));
            } catch (\Exception $e) {
                // Log error or ignore if mail not configured
            }

            // Send Email to Client
            try {
                Mail::to($order->user->email)->send(new OrderConfirmedClient($order));
            } catch (\Exception $e) {
                // Log error
            }

            $createdOrders[] = $order;
        }

        if ($request->expectsJson()) {
            return response()->json([
                'reference' => $paymentReference,
                'total_amount' => array_sum(array_map(fn($o) => $o->total_amount, $createdOrders)),
                'kkiapay_public_key' => config('services.kkiapay.public_key')
            ]);
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

        $oldStatus = $order->status;

        // Logic for automatic assignment when moving to 'preparing' (Seller accepting the order)
        if ($validated['status'] === 'preparing' && $oldStatus !== 'preparing') {
            $assignmentService = new \App\Services\DeliveryAssignmentService();
            $driver = $assignmentService->assignClosestDriver($order);

            if ($driver) {
                // Generate secure delivery code (OTP)
                $deliveryCode = rand(1000, 9999);
                $order->update(['delivery_code' => $deliveryCode]);
                
                // Note: We could notify the user here with the code
            } else {
                // If no driver found, we still move to preparing but warn the seller
                session()->flash('warning', 'Aucun livreur disponible pour le moment. La recherche continuera en arrière-plan.');
            }
        }

        $order->update(['status' => $validated['status']]);

        // Broadcast status update
        event(new \App\Events\OrderUpdated($order));

        // Si la commande passe à "delivered", on crédite le vendeur
        if ($validated['status'] === 'delivered' && $oldStatus !== 'delivered') {
            $order->shop->increment('balance', $order->seller_amount);
        }

        return back()->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * Remove the specified order from storage (Soft Delete).
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        
        // Security check: only the shop owner can delete their order
        $shop = Auth::user()->shop;
        if (!$shop || $order->shop_id !== $shop->id) {
            abort(403);
        }

        $order->delete();

        return back()->with('success', 'Commande supprimée avec succès.');
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
