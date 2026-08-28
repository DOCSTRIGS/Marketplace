<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
            'idempotency_key' => 'nullable|string|max:64',
        ]);

        $userId = Auth::id();

        if (isset($validated['latitude']) && isset($validated['longitude'])) {
            $user = Auth::user();
            $user->last_latitude = $validated['latitude'];
            $user->last_longitude = $validated['longitude'];
            $user->save();
        }

        // Sérialise les soumissions de commande d'un même client. Sans ce verrou,
        // un double-clic sur "Confirmer & Payer", un retry réseau du navigateur ou
        // une seconde tentative de paiement crée un deuxième jeu de commandes avec
        // sa propre payment_reference : le client ne règle qu'une référence via
        // KkiaPay, l'autre commande reste "pending" et pollue le tableau de bord
        // vendeur avant d'être purgée par orders:cancel-stale.
        $lock = Cache::lock("orders:store:user:{$userId}", 15);

        try {
            $lock->block(8);

            // 1. Rejeu exact de la même tentative de checkout (même clé) : on renvoie
            //    les commandes déjà créées, sans rien dupliquer.
            if (!empty($validated['idempotency_key'])) {
                $existing = Order::where('user_id', $userId)
                    ->where('idempotency_key', $validated['idempotency_key'])
                    ->get();

                if ($existing->isNotEmpty()) {
                    return $this->orderGroupResponse($request, $existing);
                }
            }

            // 2. Filet de sécurité pour un client sans clé : un panier strictement
            //    identique, encore impayé et créé il y a moins de 15 min, est réutilisé.
            $reused = $this->findReusablePendingOrders($userId, $validated['items']);
            if ($reused->isNotEmpty()) {
                return $this->orderGroupResponse($request, $reused);
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

            $createdOrders = DB::transaction(function () use ($itemsByShop, $validated, $userId, $paymentReference) {
                $orders = [];

                foreach ($itemsByShop as $shopId => $items) {
                    $totalAmount = 0;
                    foreach ($items as $item) {
                        $totalAmount += $item['product']->price * $item['quantity'];
                    }

                    $commissionAmount = $totalAmount * 0.10;
                    $sellerAmount = $totalAmount - $commissionAmount;

                    $order = Order::create([
                        'user_id' => $userId,
                        'shop_id' => $shopId,
                        'order_number' => 'CMD-' . strtoupper(Str::random(8)),
                        'total_amount' => $totalAmount,
                        'commission_amount' => $commissionAmount,
                        'seller_amount' => $sellerAmount,
                        'status' => 'pending',
                        'delivery_address' => $validated['delivery_address'],
                        'payment_method' => 'Flooz/T-Money',
                        'payment_reference' => $paymentReference,
                        'idempotency_key' => $validated['idempotency_key'] ?? null,
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

                    $orders[] = $order;
                }

                return $orders;
            });

            // Effets de bord (emails, notifications, broadcast) une fois la
            // transaction validée : ils ne doivent pas empêcher la création ni
            // être rejoués par un éventuel rollback.
            foreach ($createdOrders as $order) {
                $this->safely(
                    fn() => Mail::to($order->shop->user->email)->send(new OrderPlacedSeller($order)),
                    'OrderController@store: seller email failed',
                    ['order_id' => $order->id]
                );

                $this->safely(
                    fn() => $order->user->notify(new \App\Notifications\OrderNotification(
                        $order,
                        "Votre commande #{$order->order_number} est enregistrée ! Code de réception : {$order->delivery_code}",
                        'success'
                    )),
                    'OrderController@store: client notification failed',
                    ['order_id' => $order->id]
                );

                $this->safely(
                    fn() => event(new \App\Events\OrderUpdated($order)),
                    'OrderController@store: broadcast failed',
                    ['order_id' => $order->id]
                );
            }

            return $this->orderGroupResponse($request, collect($createdOrders));
        } catch (LockTimeoutException $e) {
            $message = 'Votre commande précédente est encore en cours de traitement. Merci de patienter quelques secondes.';
            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 429);
            }
            return back()->withErrors(['message' => $message]);
        } finally {
            optional($lock)->release();
        }
    }

    /**
     * Réponse commune pour un groupe de commandes partageant une payment_reference,
     * qu'elles viennent d'être créées ou qu'on renvoie un jeu existant (idempotence).
     */
    private function orderGroupResponse(Request $request, $orders)
    {
        $reference = $orders->first()->payment_reference;

        if ($request->expectsJson()) {
            return response()->json([
                'reference' => $reference,
                'total_amount' => (int) $orders->sum('total_amount'),
                'kkiapay_public_key' => config('services.kkiapay.public_key'),
                'kkiapay_sandbox' => config('services.kkiapay.environment', 'sandbox') !== 'live',
            ]);
        }

        return redirect()->route('checkout.show', ['reference' => $reference]);
    }

    /**
     * Cherche un groupe de commandes "pending" encore impayé (aucun
     * kkiapay_transaction_id), créé il y a moins de 15 min par ce client, dont le
     * contenu correspond exactement au panier demandé. Sert de garde-fou contre la
     * duplication quand le client ne fournit pas d'idempotency_key.
     */
    private function findReusablePendingOrders(int $userId, array $items)
    {
        $wanted = [];
        foreach ($items as $item) {
            $pid = (int) $item['id'];
            $wanted[$pid] = ($wanted[$pid] ?? 0) + (int) $item['quantity'];
        }
        ksort($wanted);

        $candidates = Order::where('user_id', $userId)
            ->where('status', 'pending')
            ->whereNull('kkiapay_transaction_id')
            ->where('created_at', '>=', now()->subMinutes(15))
            ->with('orderItems')
            ->get();

        foreach ($candidates->groupBy('payment_reference') as $group) {
            $got = [];
            foreach ($group as $order) {
                foreach ($order->orderItems as $orderItem) {
                    $pid = (int) $orderItem->product_id;
                    $got[$pid] = ($got[$pid] ?? 0) + (int) $orderItem->quantity;
                }
            }
            ksort($got);

            if ($got === $wanted) {
                return $group->values();
            }
        }

        return collect();
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
            // This is always a deliberate human decision (seller/admin): clear any
            // leftover auto_cancelled_at from a previous automatic purge, so a stale
            // marker from an earlier cycle can never make a later, unrelated human
            // cancellation look "system-cancelled" to CheckoutController::confirmPayment.
            $order->update(['status' => $validated['status'], 'auto_cancelled_at' => null]);
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
