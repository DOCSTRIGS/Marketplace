<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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
            'totalAmount' => $totalAmount
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
                'status' => 'paid',
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

        return Inertia::render('Payment/Success', [
            'reference' => $reference,
            'totalAmount' => $orders->sum('total_amount')
        ]);
    }
}
