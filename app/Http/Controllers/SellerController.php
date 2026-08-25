<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
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

        // Stats — combined into a handful of aggregate queries instead of one per stat
        $revenueStats = Order::where('shop_id', $shop->id)
            ->where('status', '!=', 'cancelled')
            ->selectRaw('SUM(seller_amount) as total_revenue, SUM(CASE WHEN created_at >= ? THEN seller_amount ELSE 0 END) as monthly_revenue', [now()->startOfMonth()])
            ->first();
        $totalRevenue = (float) $revenueStats->total_revenue;
        $monthlyRevenue = (float) $revenueStats->monthly_revenue;

        $todayOrdersCount = Order::where('shop_id', $shop->id)
            ->whereDate('created_at', now())
            ->count();

        $productStats = Product::where('shop_id', $shop->id)
            ->selectRaw('COUNT(*) as total, SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock')
            ->first();
        $activeProductsCount = (int) $productStats->total;
        $outOfStockCount = (int) $productStats->out_of_stock;

        $reviewStats = Review::where('type', 'product')
            ->whereHas('product', fn($q) => $q->where('shop_id', $shop->id))
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as cnt')
            ->first();
        $avgRating = round($reviewStats->avg_rating ?? 0, 1);
        $reviewsCount = (int) $reviewStats->cnt;

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
            [
                'name' => 'Note moyenne',
                'value' => $reviewsCount > 0 ? $avgRating . ' / 5' : 'Aucun avis',
                'change' => $reviewsCount . ' avis',
                'trend' => 'neutral'
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

        // Chart data (Last 30 days) — one grouped query instead of one query per day
        $months = [
            1 => 'Janv', 2 => 'Févr', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juil', 8 => 'Août', 9 => 'Sept', 10 => 'Oct', 11 => 'Nov', 12 => 'Déc'
        ];

        $chartStart = now()->subDays(29)->startOfDay();
        $revenueByDay = Order::where('shop_id', $shop->id)
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $chartStart)
            ->selectRaw('DATE(created_at) as day, SUM(seller_amount) as revenue')
            ->groupBy('day')
            ->pluck('revenue', 'day');

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateString = $date->format('d') . ' ' . $months[(int)$date->format('n')];

            $chartData[] = [
                'name' => $dateString,
                'revenus' => (float) ($revenueByDay[$date->format('Y-m-d')] ?? 0),
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

        $products = Product::where('shop_id', $shop->id)->with('category.parent')->latest()->get();
        return Inertia::render('Seller/Products', [
            'products' => $products,
            'categories' => \Illuminate\Support\Facades\Cache::remember('categories_with_parent', 600, function () {
                return \App\Models\Category::whereNotNull('parent_id')->get();
            })
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

        $orders = Order::with(['orderItems.product:id,name,images', 'user:id,name'])
            ->where('shop_id', $shop->id)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        // Badge stats reflect the shop's whole order history, not just the current
        // page, so they're computed separately via SQL aggregates.
        $orderStats = Order::where('shop_id', $shop->id)
            ->selectRaw("
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status IN ('paid', 'processing', 'preparing', 'accepted') THEN 1 END) as to_prepare_count,
                SUM(seller_amount) as net_earnings
            ")
            ->first();

        return Inertia::render('Seller/Orders', [
            'orders' => $orders,
            'stats' => [
                'toPrepareCount' => (int) $orderStats->to_prepare_count,
                'netEarnings' => (float) $orderStats->net_earnings,
                'totalOrders' => (int) $orderStats->total_orders,
            ],
        ]);
    }

    public function reviews()
    {
        $shop = Auth::user()->shop;
        if (!$shop || $shop->status !== 'approved') {
            return redirect()->route('seller.dashboard');
        }

        $reviews = Review::where('type', 'product')
            ->whereHas('product', fn($q) => $q->where('shop_id', $shop->id))
            ->with(['user:id,name', 'product:id,name,images'])
            ->latest()
            ->paginate(10);

        $ratingStats = Review::where('type', 'product')
            ->whereHas('product', fn($q) => $q->where('shop_id', $shop->id));

        return Inertia::render('Seller/Reviews', [
            'reviews' => $reviews,
            'avgRating' => round($ratingStats->avg('rating') ?? 0, 1),
            'reviewsCount' => (clone $ratingStats)->count(),
        ]);
    }

    public function replyReview(Request $request, $id)
    {
        $shop = Auth::user()->shop;
        $review = Review::with('product')->findOrFail($id);

        if (!$shop || !$review->product || $review->product->shop_id !== $shop->id) {
            abort(403);
        }

        $validated = $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'seller_reply' => $validated['reply'],
            'seller_replied_at' => now(),
        ]);

        return back()->with('success', 'Votre réponse a été publiée.');
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
