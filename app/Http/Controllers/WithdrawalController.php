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
    public function sellerIndex(Request $request)
    {
        $shop = Auth::user()->shop;
        if (!$shop) return redirect()->route('home');

        $transactionsQuery = \App\Models\Transaction::where('user_id', Auth::id())
            ->with('order')
            ->latest();

        if (in_array($request->input('filter'), ['credit', 'debit'], true)) {
            $transactionsQuery->where('type', $request->input('filter'));
        }

        $transactions = $transactionsQuery->paginate(20)->withQueryString();

        // Calculate monthly reports (Consistency: use Order table for all monthly performance metrics)
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        // 1. Expected Earnings from this month's orders
        $thisMonthEarnings = \App\Models\Order::where('shop_id', $shop->id)
            ->whereIn('status', ['delivered', 'shipped', 'preparing', 'pending'])
            ->where('created_at', '>=', $thisMonth)
            ->sum('seller_amount');

        $lastMonthEarnings = \App\Models\Order::where('shop_id', $shop->id)
            ->whereIn('status', ['delivered', 'shipped', 'preparing', 'pending'])
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $thisMonth)
            ->sum('seller_amount');

        $totalOrders = \App\Models\Order::where('shop_id', $shop->id)
            ->whereIn('status', ['delivered', 'shipped', 'preparing', 'pending'])
            ->where('created_at', '>=', $thisMonth)
            ->count();

        // 2. Volume and Commissions
        $totalVolume = \App\Models\Order::where('shop_id', $shop->id)
            ->whereIn('status', ['delivered', 'shipped', 'preparing', 'pending'])
            ->where('created_at', '>=', $thisMonth)
            ->sum('total_amount');
        
        $commissions = $totalVolume - $thisMonthEarnings;

        // 3. Dynamic Last Sale Date
        $lastSaleOrder = \App\Models\Order::where('shop_id', $shop->id)
            ->where('status', 'delivered')
            ->latest('delivered_at')
            ->first();
        
        $lastSaleDate = $lastSaleOrder && $lastSaleOrder->delivered_at 
            ? $lastSaleOrder->delivered_at->diffForHumans() 
            : ($lastSaleOrder ? $lastSaleOrder->created_at->diffForHumans() : 'Aucune vente');

        // 4. Ensure financial consistency: dynamic balance synchronization
        $credits = \App\Models\Transaction::where('user_id', Auth::id())
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        // Pending withdrawals already lock the funds (deducted at request time),
        // so they must count as debits too, otherwise this sync would refund them.
        $debits = \App\Models\Transaction::where('user_id', Auth::id())
            ->where('type', 'debit')
            ->whereIn('status', ['completed', 'pending'])
            ->sum('amount');

        $realBalance = $credits - $debits;

        if ($shop->balance != $realBalance) {
            $shop->update(['balance' => $realBalance]);
        }

        return inertia('Seller/Wallet', [
            'shop' => $shop,
            'transactions' => $transactions,
            'filter' => $request->input('filter', 'all'),
            'balance' => $shop->balance,
            'lastSaleDate' => $lastSaleDate,
            'reports' => [
                'thisMonthEarnings' => $thisMonthEarnings,
                'lastMonthEarnings' => $lastMonthEarnings,
                'totalOrders' => $totalOrders,
                'commissions' => max(0, $commissions),
                'growth' => $lastMonthEarnings > 0 ? round((($thisMonthEarnings - $lastMonthEarnings) / $lastMonthEarnings) * 100) : 0
            ]
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
        $withdrawal = Withdrawal::create([
            'shop_id' => $shop->id,
            'amount' => $validated['amount'],
            'status' => 'pending',
            'payment_method' => $validated['payment_method'],
            'payment_details' => $validated['payment_details'],
        ]);

        // Deduct from balance immediately to prevent double request
        $shop->decrement('balance', $validated['amount']);

        // Record debit transaction linked to withdrawal
        \App\Models\Transaction::create([
            'user_id' => $shop->user_id,
            'withdrawal_id' => $withdrawal->id,
            'amount' => $validated['amount'],
            'type' => 'debit',
            'description' => "Retrait ({$validated['payment_method']})",
            'status' => 'pending'
        ]);

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

        // Sync Financial Transaction
        $transaction = \App\Models\Transaction::where('withdrawal_id', $withdrawal->id)->first();
        if ($transaction) {
            $transaction->update([
                'status' => $request->status === 'approved' ? 'completed' : 'cancelled'
            ]);
        }

        // If rejected, refund the shop balance
        if ($request->status === 'rejected') {
            $withdrawal->shop->increment('balance', $withdrawal->amount);
        }

        return back()->with('success', 'Le statut du retrait a été mis à jour.');
    }
}
