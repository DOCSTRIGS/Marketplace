<?php

namespace App\Http\Controllers;

use App\Models\Withdrawal;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WithdrawalController extends Controller
{
    /**
     * Seller: List my withdrawals.
     */
    public function sellerIndex()
    {
        $shop = Auth::user()->shop;
        if (!$shop) return redirect()->route('home');

        $withdrawals = Withdrawal::where('shop_id', $shop->id)
            ->latest()
            ->get();

        return inertia('Seller/Wallet', [
            'withdrawals' => $withdrawals,
            'balance' => $shop->balance
        ]);
    }

    /**
     * Seller: Request a withdrawal.
     */
    public function requestWithdrawal(Request $request)
    {
        $shop = Auth::user()->shop;
        
        $validated = $request->validate([
            'amount' => 'required|numeric|min:5000', // Minimum 5000 FCFA
            'payment_method' => 'required|string|in:Flooz,T-Money,Bank',
            'payment_details' => 'required|string',
        ]);

        if ($shop->balance < $validated['amount']) {
            return back()->with('error', 'Solde insuffisant.');
        }

        // Create withdrawal request
        Withdrawal::create([
            'shop_id' => $shop->id,
            'amount' => $validated['amount'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'payment_details' => $validated['payment_details'],
        ]);

        // Deduct from balance immediately to prevent double request
        $shop->decrement('balance', $validated['amount']);

        return back()->with('success', 'Votre demande de retrait a été envoyée.');
    }

    /**
     * Admin: List all withdrawals.
     */
    public function adminIndex()
    {
        $withdrawals = Withdrawal::with('shop.user')
            ->latest()
            ->get();

        return $withdrawals; // Will be used in AdminController or directly
    }

    /**
     * Admin: Update withdrawal status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string'
        ]);

        $withdrawal = Withdrawal::findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Cette demande a déjà été traitée.');
        }

        $withdrawal->update([
            'status' => $request->status,
            'admin_note' => $request->admin_note
        ]);

        // If rejected, refund the shop balance
        if ($request->status === 'rejected') {
            $withdrawal->shop->increment('balance', $withdrawal->amount);
        }

        return back()->with('success', 'Le statut du retrait a été mis à jour.');
    }
}
