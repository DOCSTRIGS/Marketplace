<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Shop;
use App\Models\User;
use App\Models\Order;
use App\Models\Category;
use App\Models\Review;
use App\Models\Withdrawal;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Pending shops stay a plain list (action queue an admin must see in full;
        // it self-clears as items are approved/rejected, so it doesn't grow unbounded).
        $pendingShops = Shop::with('user', 'neighborhood')
            ->where('status', 'pending')
            ->latest()
            ->get();

        // These lists only grow over time, so they're paginated instead of loading
        // the entire table on every dashboard visit.
        $approvedShops = Shop::with('user', 'neighborhood')
            ->where('status', 'approved')
            ->latest()
            ->paginate(20, ['*'], 'approved_page')
            ->withQueryString();

        $rejectedShops = Shop::with('user', 'neighborhood')
            ->where('status', 'rejected')
            ->latest()
            ->paginate(20, ['*'], 'rejected_page')
            ->withQueryString();

        $shopStatusCounts = Shop::selectRaw("
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
                COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
            ")->first();

        $pendingWithdrawalsCount = Withdrawal::where('status', 'pending')->count();

        // Top 5 neighborhoods by shop count, computed in SQL across ALL shops
        // (previously recomputed client-side from the full shop lists, which broke
        // once those lists became paginated).
        $neighborhoodStats = DB::table('shops')
            ->leftJoin('neighborhoods', 'shops.neighborhood_id', '=', 'neighborhoods.id')
            ->selectRaw("COALESCE(neighborhoods.name, 'Lomé') as name, COUNT(*) as value")
            ->groupByRaw("COALESCE(neighborhoods.name, 'Lomé')")
            ->orderByDesc('value')
            ->take(5)
            ->get();

        $stats = [
            'total_users' => User::count(),
            'total_shops' => (int) $shopStatusCounts->approved,
            'total_pending_shops' => (int) $shopStatusCounts->pending,
            'total_rejected_shops' => (int) $shopStatusCounts->rejected,
            'total_pending_withdrawals' => $pendingWithdrawalsCount,
            'total_orders' => Order::count(),
            'total_revenue' => (float) Order::where('status', '!=', 'cancelled')->sum('total_amount'),
            'total_commissions' => (float) Order::where('status', '!=', 'cancelled')->sum('commission_amount'),
        ];

        $categories = Category::withCount('children')->get();
        $users = User::where('role', '!=', 'driver')->latest()->paginate(20, ['*'], 'users_page')->withQueryString();
        $drivers = User::where('role', 'driver')
            ->withAvg('driverReviews', 'rating')
            ->withCount('driverReviews')
            ->orderByDesc('updated_at')
            ->paginate(20, ['*'], 'drivers_page')
            ->withQueryString();
        $reviews = Review::with(['user', 'product.shop', 'driver'])->latest()->paginate(20, ['*'], 'reviews_page')->withQueryString();
        $withdrawals = Withdrawal::with('shop.user')->latest()->paginate(20, ['*'], 'withdrawals_page')->withQueryString();

        // Real Chart data for the last 7 days + Comparison with previous week
        // Collapsed from 4 queries x 7 days (28 round trips) into 3 grouped queries.
        $currentStart = now()->subDays(6)->startOfDay();
        $currentEnd = now()->endOfDay();
        $prevStart = now()->subDays(13)->startOfDay();
        $prevEnd = now()->subDays(7)->endOfDay();

        $currentStats = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw('DATE(created_at) as day, SUM(total_amount) as revenue, SUM(commission_amount) as commission')
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $prevRevenueByDay = Order::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->selectRaw('DATE(created_at) as day, SUM(total_amount) as revenue')
            ->groupBy('day')
            ->pluck('revenue', 'day');

        $ordersCountByDay = Order::whereBetween('created_at', [$currentStart, $currentEnd])
            ->selectRaw('DATE(created_at) as day, COUNT(*) as cnt')
            ->groupBy('day')
            ->pluck('cnt', 'day');

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $prevDate = now()->subDays($i + 7);
            $dayKey = $date->format('Y-m-d');
            $prevDayKey = $prevDate->format('Y-m-d');
            $current = $currentStats[$dayKey] ?? null;

            $chartData[] = [
                'name' => $date->format('d/m'),
                'revenue' => (float) ($current->revenue ?? 0),
                'prev_revenue' => (float) ($prevRevenueByDay[$prevDayKey] ?? 0),
                'commission' => (float) ($current->commission ?? 0),
                'orders' => (int) ($ordersCountByDay[$dayKey] ?? 0),
            ];
        }

        // Real Category distribution data
        $categoryStats = Category::whereNull('parent_id')
            ->withCount('products')
            ->orderBy('products_count', 'desc')
            ->get()
            ->map(fn($cat) => [
                'name' => $cat->name,
                'value' => $cat->products_count, // Real count
            ]);

        return Inertia::render('Admin/Dashboard', [
            'pendingShops'  => $pendingShops,
            'approvedShops' => $approvedShops,
            'rejectedShops' => $rejectedShops,
            'stats'         => $stats,
            'categories'    => $categories,
            'users'         => $users,
            'drivers'       => $drivers,
            'reviews'       => $reviews,
            'withdrawals'   => $withdrawals,
            'chartData'     => $chartData,
            'categoryStats' => $categoryStats,
            'neighborhoodStats' => $neighborhoodStats,
        ]);
    }

    public function updateShopStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,pending'
        ]);

        $shop = Shop::findOrFail($id);
        $shop->status = $request->status;
        $shop->save();

        return redirect()->back()->with('success', 'Statut de la boutique mis à jour avec succès.');
    }

    public function deleteShop($id)
    {
        $shop = Shop::findOrFail($id);
        $shop->delete();
        return redirect()->back()->with('success', 'Boutique supprimée avec succès.');
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:client,seller,admin'
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => $validated['role']
        ]);

        return redirect()->back()->with('success', 'Utilisateur créé avec succès.');
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|string|in:client,seller,admin'
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', 'Utilisateur mis à jour.');
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Impossible de vous supprimer vous-même.');
        }
        $user->delete();
        return redirect()->back()->with('success', 'Utilisateur supprimé.');
    }

    public function toggleAdminRole($id)
    {
        $user = User::findOrFail($id);
        
        // Don't allow toggling own admin status to prevent lockout
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas modifier votre propre statut admin.');
        }

        if ($user->role === 'admin') {
            // Default to client if no shop, otherwise could be seller but client is safer
            $user->role = $user->shop ? 'seller' : 'client';
        } else {
            $user->role = 'admin';
        }
        
        $user->save();

        return redirect()->back()->with('success', 'Rôle de l\'utilisateur mis à jour.');
    }

    public function deleteReview($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();
        return redirect()->back()->with('success', 'Avis supprimé avec succès.');
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name'
        ]);

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => null
        ]);

        return redirect()->back()->with('success', 'Catégorie ajoutée avec succès.');
    }

    public function storeSubCategory(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name'
        ]);

        $parent = Category::findOrFail($id);

        Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'parent_id' => $parent->id
        ]);

        return redirect()->back()->with('success', 'Sous-catégorie ajoutée avec succès.');
    }

    public function updateCategory(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id
        ]);

        $category = Category::findOrFail($id);
        $category->name = $request->name;
        $category->slug = Str::slug($request->name);
        $category->save();

        return redirect()->back()->with('success', 'Catégorie modifiée avec succès.');
    }

    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);

        // Delete children first
        $category->children()->delete();
        $category->delete();

        return redirect()->back()->with('success', 'Catégorie supprimée avec succès.');
    }

    public function financialReport()
    {
        $orders = Order::with('shop.user')
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->paginate(20);

        $orderStats = Order::where('status', '!=', 'cancelled')
            ->selectRaw('SUM(total_amount) as total_revenue, SUM(commission_amount) as total_commissions')
            ->first();
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->sum('amount');

        return Inertia::render('Admin/Finance', [
            'orders' => $orders,
            'stats' => [
                'total_revenue' => (float) $orderStats->total_revenue,
                'total_commissions' => (float) $orderStats->total_commissions,
                'pending_withdrawals' => (float) $pendingWithdrawals,
            ]
        ]);
    }

    public function verifyKYC(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'note' => 'nullable|string'
        ]);

        $shop = Shop::findOrFail($id);
        $shop->update([
            'is_verified' => $request->status === 'approved',
            'admin_note' => $request->note
        ]);

        return redirect()->back()->with('success', 'Statut de vérification mis à jour.');
    }
}
