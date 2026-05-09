<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    /**
     * Show the shop creation form.
     */
    public function create()
    {
        $neighborhoods = \App\Models\Neighborhood::orderBy('name')->get();
        $categories = \App\Models\Category::whereNull('parent_id')->orderBy('name')->get();

        return Inertia::render('Seller/ShopSetup', [
            'neighborhoods' => $neighborhoods,
            'categories' => $categories
        ]);
    }

    /**
     * Get shops and products for the Map View.
     */
    public function mapData(Request $request)
    {
        $search = $request->input('search');

        $query = Shop::with(['neighborhood', 'products' => function($q) use ($search) {
            if ($search) {
                $q->where('name', 'like', "%{$search}%");
            }
        }]);

        if ($search) {
            // Filter shops that have products matching the search OR match the shop name
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('products', function($pq) use ($search) {
                      $pq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Only include shops that have valid coordinates
        $query->whereNotNull('latitude')->whereNotNull('longitude');

        $shops = $query->get()->map(function($shop) {
            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'address' => $shop->neighborhood->name ?? 'Lomé',
                'coordinates' => [
                    'lat' => (float)$shop->latitude,
                    'lng' => (float)$shop->longitude
                ],
                'image' => $shop->logo ? asset('storage/' . $shop->logo) : 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=400&q=80',
                'matching_products' => $shop->products,
                // For the UI, we take the price of the first matching product or a default
                'price' => $shop->products->first() ? number_format((float)$shop->products->first()->price, 0, ',', ' ') . ' FCFA' : 'Voir catalogue'
            ];
        });

        if ($request->wantsJson()) {
            return response()->json($shops);
        }

        return Inertia::render('MapView', [
            'initialShops' => $shops
        ]);
    }

    /**
     * Store a new shop (Seller onboarding).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slogan' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'phone' => 'nullable|string',
            'categories' => 'nullable|array',
            'delivery_available' => 'boolean',
            'delivery_fee' => 'nullable|string',
            'coverage_area' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $user = Auth::user();

        $shop = Shop::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'slogan' => $validated['slogan'],
            'description' => $validated['description'],
            'neighborhood_id' => $validated['neighborhood_id'],
            'phone' => $validated['phone'],
            'categories' => $validated['categories'],
            'delivery_available' => $validated['delivery_available'],
            'delivery_fee' => $validated['delivery_fee'],
            'coverage_area' => $validated['coverage_area'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'slug' => Str::slug($validated['name']) . '-' . time(),
        ]);

        // Enforce seller role
        $user->update(['role' => 'seller']);

        return redirect()->route('seller.dashboard')->with('success', 'Votre boutique a été créée !');
    }

    /**
     * Display the seller live tracking view.
     */
    public function sellerTracking()
    {
        return Inertia::render('Seller/LiveTracking');
    }
}
