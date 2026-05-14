<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SellerController extends Controller
{
    /**
     * Check if the seller's shop is approved.
     */
    private function checkApproval()
    {
        $shop = Auth::user()->shop;
        if (!$shop || $shop->status !== 'approved') {
            return $shop;
        }
        return true;
    }

    public function dashboard()
    {
        $user = Auth::user();
        $shop = Shop::where('user_id', $user->id)->first();

        if (!$shop || $shop->status !== 'approved') {
            return Inertia::render('Seller/PendingApproval', [
                'shop' => $shop
            ]);
        }

        // Stats
        $monthlyRevenue = Order::where('shop_id', $shop->id)
            ->where('status', '!=', 'cancelled')
            ->whereMonth('created_at', now()->month)
            ->sum('seller_amount');

        $todayOrdersCount = Order::where('shop_id', $shop->id)
            ->whereDate('created_at', now())
            ->count();

        $activeProductsCount = Product::where('shop_id', $shop->id)->count();
        $outOfStockCount = Product::where('shop_id', $shop->id)->where('stock', 0)->count();

        $stats = [
            ['name' => 'Mes Gains (Net)', 'value' => number_format($monthlyRevenue, 0, ',', ' ') . ' FCFA', 'change' => '+0%', 'trend' => 'neutral'],
            ['name' => 'Commandes du jour', 'value' => (string) $todayOrdersCount, 'change' => '+0', 'trend' => 'neutral'],
            ['name' => 'Produits actifs', 'value' => (string) $activeProductsCount, 'change' => '0', 'trend' => 'neutral'],
            ['name' => 'Produits en rupture', 'value' => (string) $outOfStockCount, 'change' => '0', 'trend' => 'neutral'],
        ];

        // Recent Orders
        $recentOrders = Order::with('user')
            ->where('shop_id', $shop->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id' => '#' . $order->order_number,
                'customer' => $order->user->name,
                'product' => 'Commande ' . $order->order_number, // We could fetch items too
                'amount' => number_format($order->seller_amount, 0, ',', ' ') . ' FCFA',
                'status' => $this->translateStatus($order->status),
                'date' => $order->created_at->diffForHumans(),
            ]);

        // Chart data (Last 7 days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $revenue = Order::where('shop_id', $shop->id)
                ->whereDate('created_at', $date)
                ->where('status', '!=', 'cancelled')
                ->sum('seller_amount');

            $chartData[] = [
                'name' => $date->format('D'),
                'revenus' => (float) $revenue
            ];
        }

        // Active Trackings (Orders in progress)
        $activeTrackings = Order::with(['user', 'orderItems.product'])
            ->where('shop_id', $shop->id)
            ->whereIn('status', ['pending', 'processing', 'shipped'])
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($order) => [
                'id' => '#' . $order->order_number,
                'dest' => $order->delivery_address ?? 'Lomé, Togo',
                'status' => $this->translateStatus($order->status),
                'progress' => match($order->status) {
                    'pending' => 15,
                    'processing' => 45,
                    'shipped' => 85,
                    default => 0
                },
                'courier' => 'Livreur LoméShop', // Could be dynamic if we have a driver_id
            ]);

        return Inertia::render('Seller/Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'chartData' => $chartData,
            'activeTrackings' => $activeTrackings
        ]);

    }

    private function translateStatus($status)
    {
        return match ($status) {
            'pending' => 'En attente',
            'processing' => 'En préparation',
            'shipped' => 'Expédié',
            'delivered' => 'Livré',
            'cancelled' => 'Annulé',
            default => $status,
        };
    }

    public function products()
    {
        $shop = Auth::user()->shop;
        if (!$shop || $shop->status !== 'approved') {
            return redirect()->route('seller.dashboard');
        }

        $products = Product::where('shop_id', $shop->id)->latest()->get();
        return Inertia::render('Seller/Products', [
            'products' => $products,
            'categories' => \App\Models\Category::whereNotNull('parent_id')->get()
        ]);
    }

    public function settings()
    {
        return Inertia::render('Seller/Settings', [
            'user' => Auth::user(),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        
        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        return back()->with('success', 'Profil mis à jour avec succès.');
    }
    public function orders()
    {
        $shop = Auth::user()->shop;
        if (!$shop || $shop->status !== 'approved') {
            return redirect()->route('seller.dashboard');
        }

        $orders = Order::with(['orderItems.product', 'user'])
            ->where('shop_id', $shop->id)
            ->latest()
            ->get();

        return Inertia::render('Seller/Orders', [
            'orders' => $orders
        ]);
    }

    public function tracking()
    {
        $shop = Auth::user()->shop;
        
        $order = null;
        if ($shop) {
            $order = Order::where('shop_id', $shop->id)
                ->with(['orderItems.product', 'shop', 'user'])
                ->latest()
                ->first();
        }

        return Inertia::render('Seller/Tracking', [
            'order' => $order
        ]);
    }
}
