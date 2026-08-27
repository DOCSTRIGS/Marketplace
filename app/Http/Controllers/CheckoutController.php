<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    /**
     * Affiche la page de livraison.
     */
    public function delivery()
    {
        return Inertia::render('Checkout/Delivery');
    }

    /**
     * Affiche la page de paiement simulée.
     */
    public function show($reference)
    {
        $orders = Order::where('payment_reference', $reference)
            ->where('user_id', Auth::id())
            ->with('orderItems.product')
            ->get();

        if ($orders->isEmpty()) {
            abort(404, 'Référence de paiement invalide.');
        }

        // Si c'est déjà payé, on redirige
        if ($orders->first()->status !== 'pending') {
            return redirect()->route('checkout.success', ['reference' => $reference]);
        }

        $totalAmount = $orders->sum('total_amount');

        return Inertia::render('Payment/Checkout', [
            'reference' => $reference,
            'orders' => $orders,
            'totalAmount' => $totalAmount,
            'fedapay_public_key' => config('services.fedapay.public_key')
        ]);
    }

    /**
     * Traite le paiement (Simulation API).
     */
    public function process(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required|string',
            'payment_method' => 'required|string', // ex: T-Money, Flooz
            'phone_number' => 'required|string'
        ]);

        $orders = Order::where('payment_reference', $validated['reference'])
            ->where('user_id', Auth::id())
            ->get();

        if ($orders->isEmpty() || $orders->first()->status !== 'pending') {
            return back()->withErrors(['message' => 'Paiement invalide ou déjà traité.']);
        }

        // Ici, en réalité on appellerait l'API FedaPay ou PayGate.
        // Puisque c'est une simulation réussie, on met à jour le statut.
        foreach ($orders as $order) {
            $order->update([
                'status' => 'processing',
                'payment_method' => $validated['payment_method']
            ]);
        }


        return redirect()->route('checkout.success', ['reference' => $validated['reference']]);
    }

    /**
     * Affiche la page de succès. Ne marque plus la commande payée ici :
     * confirmPayment() est l'unique endroit qui fait cette transition,
     * après vérification serveur auprès de KkiaPay.
     */
    public function success($reference)
    {
        $orders = Order::where('payment_reference', $reference)
            ->where('user_id', Auth::id())
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->route('home');
        }

        // Un panier multi-boutique peut avoir des commandes sœurs à des statuts
        // différents (ex. l'une payée, l'autre annulée par un vendeur) : on ne peut
        // pas se fier à la première venue. Priorité à "payé" dès qu'au moins une
        // commande l'est réellement — un client débité ne doit jamais atterrir sur
        // "Commande annulée, contactez le support" alors qu'une partie a abouti.
        $paidStatuses = ['paid', 'preparing', 'shipped', 'delivered'];
        if ($orders->contains(fn ($order) => in_array($order->status, $paidStatuses, true))) {
            $status = 'paid';
        } elseif ($orders->every(fn ($order) => $order->status === 'cancelled')) {
            $status = 'cancelled';
        } else {
            $status = 'pending';
        }

        return Inertia::render('Payment/Success', [
            'reference' => $reference,
            'totalAmount' => $orders->sum('total_amount'),
            'firstOrderId' => $orders->first()->id,
            'status' => $status,
        ]);
    }

    /**
     * Confirme un paiement KkiaPay : vérifie côté serveur auprès de l'API
     * KkiaPay (jamais en se fiant au seul callback client) avant de marquer
     * la commande comme payée.
     */
    public function confirmPayment(Request $request, $reference)
    {
        $validated = $request->validate([
            'transaction_id' => 'required|string',
        ]);

        Log::info('KkiaPay: confirmPayment called', [
            'reference' => $reference,
            'transaction_id' => $validated['transaction_id'],
            'user_id' => Auth::id(),
        ]);

        $orders = Order::where('payment_reference', $reference)
            ->where('user_id', Auth::id())
            ->with('orderItems')
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Commande non trouvée.'], 404);
        }

        // Un panier peut couvrir plusieurs boutiques : $orders contient alors
        // plusieurs lignes partageant la même payment_reference. Chacune peut avoir
        // évolué indépendamment depuis la création (ex. un vendeur annule sa propre
        // commande pendant que l'autre boutique attend toujours le paiement) — on
        // ne peut donc pas se fier au seul statut de la première. Voir Order::isResurrectable().

        // Idempotent : déjà confirmée (ex. double appel réseau) — rien à faire si
        // aucune commande du groupe n'est en attente ou "ressuscitable". Une
        // annulation humaine (vendeur/admin) n'a jamais auto_cancelled_at renseigné
        // et reste donc, elle, définitivement fermée : cf. boucle plus bas, qui
        // ignore individuellement toute commande non éligible.
        if ($orders->every(fn ($order) => !$order->isResurrectable())) {
            return response()->json(['status' => 'already_confirmed']);
        }

        // Un même transactionId KkiaPay ne doit pouvoir payer qu'une seule référence.
        if (Order::where('kkiapay_transaction_id', $validated['transaction_id'])->exists()) {
            Log::warning('KkiaPay: transaction_id already used', [
                'transaction_id' => $validated['transaction_id'],
                'reference' => $reference,
            ]);
            return response()->json(['message' => 'Cette transaction a déjà été utilisée.'], 422);
        }

        $environment = config('services.kkiapay.environment', 'sandbox');
        $baseUrl = $environment === 'live'
            ? 'https://api.kkiapay.me'
            : 'https://api-sandbox.kkiapay.me';

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.kkiapay.public_key'),
                'Authorization' => config('services.kkiapay.secret_key'),
            ])->post("{$baseUrl}/api/v1/transactions/status", [
                'transactionId' => $validated['transaction_id'],
            ]);
        } catch (\Exception $e) {
            Log::error('KkiaPay: verification request failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Impossible de vérifier le paiement pour le moment.'], 502);
        }

        if (!$response->successful()) {
            Log::error('KkiaPay: verification API error', ['body' => $response->body()]);
            return response()->json(['message' => 'Échec de la vérification du paiement.'], 502);
        }

        $data = $response->json();
        $expectedAmount = (int) $orders->sum('total_amount');
        $paidAmount = (int) ($data['amount'] ?? 0);
        $isSuccess = strtoupper($data['status'] ?? '') === 'SUCCESS';

        if (!$isSuccess || $paidAmount < $expectedAmount) {
            Log::warning('KkiaPay: payment not verified', [
                'reference' => $reference,
                'response' => $data,
                'expected_amount' => $expectedAmount,
            ]);
            return response()->json(['message' => 'Le paiement n\'a pas pu être confirmé.'], 422);
        }

        foreach ($orders as $order) {
            // Re-vérifie et applique la condition de façon atomique au niveau SQL
            // (au lieu de se fier au $order chargé en mémoire avant l'appel réseau
            // KkiaPay ci-dessus) : si un vendeur a annulé cette commande précise
            // pendant cette fenêtre, la clause WHERE ne matche plus rien et cette
            // commande reste ignorée, même si elle était éligible au moment du chargement.
            $updated = Order::where('id', $order->id)
                ->where(function ($q) {
                    $q->where('status', 'pending')
                        ->orWhere(function ($q2) {
                            $q2->where('status', 'cancelled')->whereNotNull('auto_cancelled_at');
                        });
                })
                ->update([
                    'status' => 'paid',
                    'kkiapay_transaction_id' => $validated['transaction_id'],
                    // On efface la marque de la purge auto : si cette commande est de
                    // nouveau annulée plus tard, ce sera forcément une action humaine,
                    // qui ne doit plus jamais pouvoir être "ressuscitée" par ce même code.
                    'auto_cancelled_at' => null,
                ]);

            if (!$updated) {
                continue;
            }

            foreach ($order->orderItems as $orderItem) {
                // N'affecte que les lignes où le stock est encore suffisant : évite un
                // stock négatif si deux clients ont payé le même produit en même temps.
                $affected = Product::where('id', $orderItem->product_id)
                    ->where('stock', '>=', $orderItem->quantity)
                    ->decrement('stock', $orderItem->quantity);

                if ($affected) {
                    \App\Models\StockMovement::create([
                        'product_id' => $orderItem->product_id,
                        'order_id' => $order->id,
                        'type' => 'sale',
                        'quantity' => $orderItem->quantity,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'confirmed']);
    }
}
