<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use FedaPay\FedaPay;
use FedaPay\Transaction;

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
     * Affiche la page de succès.
     */
    public function success($reference)
    {
        $orders = Order::where('payment_reference', $reference)
            ->where('user_id', Auth::id())
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->route('home');
        }

        // Marquer comme payé si c'était en attente (Paiement KkiaPay réussi)
        foreach ($orders as $order) {
            if ($order->status === 'pending') {
                $order->update(['status' => 'paid']);
            }
        }

        return Inertia::render('Payment/Success', [
            'reference' => $reference,
            'totalAmount' => $orders->sum('total_amount'),
            'firstOrderId' => $orders->first()->id
        ]);
    }

    /**
     * Initialise une transaction FedaPay et retourne un token.
     */
    public function createTransaction(Request $request)
    {
        $request->validate(['reference' => 'required|string']);

        $secretKey = config('services.fedapay.secret_key');
        $environment = config('services.fedapay.environment');

        FedaPay::setApiKey($secretKey);
        FedaPay::setEnvironment($environment);

        $orders = Order::where('payment_reference', $request->reference)
            ->where('user_id', Auth::id())
            ->get();

        if ($orders->isEmpty()) {
            \Log::error('FedaPay: Order not found', ['reference' => $request->reference]);
            return response()->json(['message' => 'Commande non trouvée'], 404);
        }

        $totalAmount = (int) $orders->sum('total_amount');
        
        \Log::info('FedaPay: Creating transaction', [
            'reference' => $request->reference,
            'amount' => $totalAmount,
            'env' => $environment
        ]);

        try {
            $user = Auth::user();
            $nameParts = explode(' ', $user->name, 2);
            $firstname = $nameParts[0];
            $lastname = $nameParts[1] ?? 'Client';

            $transaction = Transaction::create([
                'description' => 'Achat LoméShop ' . $request->reference,
                'amount' => (int) $totalAmount,
                'currency' => ['iso' => 'XOF'],
                'callback_url' => route('checkout.success', ['reference' => $request->reference]),
            ]);
            
            // On peut toujours ajouter l'email seul si besoin, mais testons sans rien d'abord.

            $token = $transaction->generateToken();

            \Log::info('FedaPay: Token generated', ['token' => $token->token]);

            return response()->json([
                'id' => $transaction->id,
                'token' => $token->token,
                'url' => $token->url
            ]);
        } catch (\Exception $e) {
            \Log::error('FedaPay: Transaction creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Erreur FedaPay: ' . $e->getMessage()], 500);
        }
    }
}
