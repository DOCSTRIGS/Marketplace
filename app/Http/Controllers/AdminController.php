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

class AdminController extends Controller
{
    public function dashboard()
    {
        $pendingShops = Shop::with('user', 'neighborhood')
            ->where('status', 'pending')
            ->get();
            
        $approvedShops = Shop::with('user', 'neighborhood')
            ->where('status', 'approved')
            ->get();

        $rejectedShops = Shop::with('user', 'neighborhood')
            ->where('status', 'rejected')
            ->get();

        $stats = [
            'total_users' => User::count(),
            'total_shops' => Shop::where('status', 'approved')->count(),
            'total_orders' => Order::count(),
            'total_revenue' => (float) Order::where('status', '!=', 'cancelled')->sum('total_amount'),
            'total_commissions' => (float) Order::where('status', '!=', 'cancelled')->sum('commission_amount'),
        ];

        $categories = Category::withCount('children')->get();
        $users = User::where('role', '!=', 'driver')->latest()->get();
        $drivers = User::where('role', 'driver')
            ->orderByRaw('updated_at DESC')
            ->get();
        $reviews = Review::with(['user', 'product.shop'])->latest()->get();
        $withdrawals = Withdrawal::with('shop.user')->latest()->get();

        // Real Chart data for the last 7 days + Comparison with previous week
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $prevDate = now()->subDays($i + 7);
            
            $dateString = $date->format('d/m');
            
            $revenue = Order::whereDate('created_at', $date)->where('status', '!=', 'cancelled')->sum('total_amount');
            $prevRevenue = Order::whereDate('created_at', $prevDate)->where('status', '!=', 'cancelled')->sum('total_amount');
                
            $commission = Order::whereDate('created_at', $date)->where('status', '!=', 'cancelled')->sum('commission_amount');
            $ordersCount = Order::whereDate('created_at', $date)->count();

            $chartData[] = [
                'name' => $dateString,
                'revenue' => (float) $revenue,
                'prev_revenue' => (float) $prevRevenue,
                'commission' => (float) $commission,
                'orders' => $ordersCount,
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
            'categoryStats' => $categoryStats
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

        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $totalCommissions = Order::where('status', '!=', 'cancelled')->sum('commission_amount');
        $pendingWithdrawals = Withdrawal::where('status', 'pending')->sum('amount');

        return Inertia::render('Admin/Finance', [
            'orders' => $orders,
            'stats' => [
                'total_revenue' => (float)$totalRevenue,
                'total_commissions' => (float)$totalCommissions,
                'pending_withdrawals' => (float)$pendingWithdrawals,
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
