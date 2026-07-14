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
        $shop = $user->shop;

        if (!$shop) {
            return redirect()->route('shops.create');
        }

        if ($shop->status !== 'approved') {
            return Inertia::render('Seller/PendingApproval', [
                'shop' => $shop
            ]);
        }

        // Stats
        $totalRevenue = Order::where('shop_id', $shop->id)
            ->where('status', '!=', 'cancelled')
            ->sum('seller_amount');

        $monthlyRevenue = Order::where('shop_id', $shop->id)
            ->where('status', '!=', 'cancelled')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('seller_amount');

        $todayOrdersCount = Order::where('shop_id', $shop->id)
            ->whereDate('created_at', now())
            ->count();

        $activeProductsCount = Product::where('shop_id', $shop->id)->count();
        $outOfStockCount = Product::where('shop_id', $shop->id)->where('stock', 0)->count();

        $stats = [
            [
                'name' => 'Solde Disponible', 
                'value' => number_format((float)$shop->balance, 0, ',', ' ') . ' FCFA', 
                'change' => 'Retirable', 
                'trend' => 'up'
            ],
            [
                'name' => 'Gains Totaux (Net)', 
                'value' => number_format($totalRevenue, 0, ',', ' ') . ' FCFA', 
                'change' => 'Cumulé', 
                'trend' => 'up'
            ],
            [
                'name' => 'Gains du Mois', 
                'value' => number_format($monthlyRevenue, 0, ',', ' ') . ' FCFA', 
                'change' => 'Ce mois', 
                'trend' => 'neutral'
            ],
            [
                'name' => 'Commandes du jour', 
                'value' => (string) $todayOrdersCount, 
                'change' => 'Aujourd\'hui', 
                'trend' => 'neutral'
            ],
            [
                'name' => 'Produits en boutique', 
                'value' => (string) $activeProductsCount . ' actifs', 
                'change' => $outOfStockCount > 0 ? (string)$outOfStockCount . ' en rupture' : 'Stock OK', 
                'trend' => $outOfStockCount > 0 ? 'down' : 'neutral'
            ],
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

        // Chart data (Last 30 days)
        $chartData = [];
        $months = [
            1 => 'Janv', 2 => 'Févr', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sept', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];
        
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $revenue = Order::where('shop_id', $shop->id)
                ->whereDate('created_at', $date)
                ->where('status', '!=', 'cancelled')
                ->sum('seller_amount');

            $dateString = $date->format('d') . ' ' . $months[(int)$date->format('n')];

            $chartData[] = [
                'name' => $dateString,
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
            'shop' => Auth::user()->shop,
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
    public function wallet()
    {
        $shop = Auth::user()->shop;
        if (!$shop) return redirect()->route('shops.create');

        $transactions = \App\Models\Transaction::where('user_id', Auth::id())
            ->with('order')
            ->latest()
            ->get();

        return Inertia::render('Seller/Wallet', [
            'shop' => $shop,
            'transactions' => $transactions
        ]);
    }

    const LOW_STOCK_THRESHOLD = 10;

    public function inventory()
    {
        $shop = Auth::user()->shop;
        if (!$shop || $shop->status !== 'approved') {
            return redirect()->route('seller.dashboard');
        }

        $products = Product::where('shop_id', $shop->id)
            ->orderBy('stock', 'asc')
            ->get();

        $movements = \App\Models\StockMovement::whereIn('product_id', $products->pluck('id'))
            ->with('product:id,name')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($m) => [
                'id' => $m->id,
                'product_name' => $m->product->name ?? 'Produit supprimé',
                'type' => $m->type,
                'quantity' => $m->quantity,
                'note' => $m->note,
                'date' => $m->created_at->diffForHumans(),
            ]);

        return Inertia::render('Seller/Inventory', [
            'products' => $products,
            'movements' => $movements,
            'lowStockThreshold' => self::LOW_STOCK_THRESHOLD,
        ]);
    }

    public function restock(Request $request, $id)
    {
        $shop = Auth::user()->shop;
        $product = Product::findOrFail($id);

        if (!$shop || $product->shop_id !== $shop->id) {
            abort(403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:255',
        ]);

        $product->increment('stock', $validated['quantity']);

        \App\Models\StockMovement::create([
            'product_id' => $product->id,
            'type' => 'restock',
            'quantity' => $validated['quantity'],
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', "Stock de \"{$product->name}\" mis à jour.");
    }
}
