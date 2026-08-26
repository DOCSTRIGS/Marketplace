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
use App\Traits\NotifiesSafely;

class OrderController extends Controller
{
    use NotifiesSafely;

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
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            $user = Auth::user();
            $user->last_latitude = $validated['latitude'];
            $user->last_longitude = $validated['longitude'];
            $user->save();
        }

        $products = Product::whereIn('id', array_column($validated['items'], 'id'))
            ->get()
            ->keyBy('id');

        $itemsByShop = [];
        foreach ($validated['items'] as $itemData) {
            $product = $products[$itemData['id']];

            if ($product->stock < $itemData['quantity']) {
                $message = "Stock insuffisant pour \"{$product->name}\" (disponible : {$product->stock}).";
                if ($request->expectsJson()) {
                    return response()->json(['message' => $message], 422);
                }
                return back()->withErrors(['message' => $message]);
            }

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
                'delivery_code' => rand(1000, 9999),
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
            $this->safely(
                fn() => Mail::to($order->shop->user->email)->send(new OrderPlacedSeller($order)),
                'OrderController@store: seller email failed',
                ['order_id' => $order->id]
            );

            // Send Notification to Client with OTP
            $this->safely(
                fn() => $order->user->notify(new \App\Notifications\OrderNotification(
                    $order,
                    "Votre commande #{$order->order_number} est enregistrée ! Code de réception : {$order->delivery_code}",
                    'success'
                )),
                'OrderController@store: client notification failed',
                ['order_id' => $order->id]
            );

            // Real-time broadcast for Seller
            $this->safely(
                fn() => event(new \App\Events\OrderUpdated($order)),
                'OrderController@store: broadcast failed',
                ['order_id' => $order->id]
            );

            $createdOrders[] = $order;
        }

        if ($request->expectsJson()) {
            return response()->json([
                'reference' => $paymentReference,
                'total_amount' => array_sum(array_map(fn($o) => $o->total_amount, $createdOrders)),
                'kkiapay_public_key' => config('services.kkiapay.public_key'),
                'kkiapay_sandbox' => config('services.kkiapay.environment', 'sandbox') !== 'live'
            ]);
        }

        return redirect()->route('checkout.show', ['reference' => $paymentReference]);
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

            if (!$driver) {
                // If no driver found, we still move to preparing but warn the seller
                session()->flash('warning', 'Aucun livreur disponible pour le moment. La recherche continuera en arrière-plan.');
            }
        }

        // Only update status if it wasn't already moved to 'shipped' by the service
        if ($order->status !== 'shipped') {
            $order->update(['status' => $validated['status']]);
        }

        // Broadcast status update
        $this->safely(
            fn() => event(new \App\Events\OrderUpdated($order)),
            'OrderController@updateStatus: broadcast failed',
            ['order_id' => $order->id]
        );

        // Si une commande déjà payée est annulée, on restitue le stock décrémenté au paiement
        $postPaymentStatuses = ['paid', 'preparing', 'shipped'];
        if ($validated['status'] === 'cancelled' && in_array($oldStatus, $postPaymentStatuses)) {
            foreach ($order->orderItems as $orderItem) {
                Product::where('id', $orderItem->product_id)->increment('stock', $orderItem->quantity);

                \App\Models\StockMovement::create([
                    'product_id' => $orderItem->product_id,
                    'order_id' => $order->id,
                    'type' => 'cancellation',
                    'quantity' => $orderItem->quantity,
                ]);
            }
        }

        // Si la commande passe à "delivered", on crédite le vendeur
        if ($validated['status'] === 'delivered' && $oldStatus !== 'delivered') {
            $order->shop->increment('balance', $order->seller_amount);
            
            // Enregistrer la transaction dans l'historique
            \App\Models\Transaction::create([
                'user_id' => $order->shop->user_id,
                'order_id' => $order->id,
                'amount' => $order->seller_amount,
                'type' => 'credit',
                'description' => "Vente - Commande {$order->order_number}",
                'status' => 'completed'
            ]);
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
            ->with(['orderItems.product', 'shop', 'driver'])
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('MyOrders', [
            'orders' => $orders
        ]);
    }

    /**
     * Generate and download the PDF receipt for a paid order.
     */
    public function receipt($id)
    {
        $order = Order::with(['orderItems.product', 'shop', 'user'])->findOrFail($id);

        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        if ($order->status === 'pending') {
            abort(404, 'Le reçu n\'est disponible qu\'après confirmation du paiement.');
        }

        $statusLabels = [
            'paid' => 'Payé',
            'processing' => 'En cours',
            'preparing' => 'En préparation',
            'shipped' => 'Expédié',
            'delivered' => 'Livré',
            'cancelled' => 'Annulé',
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.order', [
            'order' => $order,
            'statusLabel' => $statusLabels[$order->status] ?? $order->status,
        ]);

        return $pdf->download("recu-{$order->order_number}.pdf");
    }
}
