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
        $neighborhoods = \Illuminate\Support\Facades\Cache::remember('neighborhoods_all', 600, function () {
            return \App\Models\Neighborhood::orderBy('name')->get();
        });
        $categories = \Illuminate\Support\Facades\Cache::remember('categories_top_level', 600, function () {
            return \App\Models\Category::whereNull('parent_id')->orderBy('name')->get();
        });

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
        $likeOp = Shop::query()->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        // The map only ever renders id/name/price/images[0] per product, so avoid
        // pulling large columns (description, full images array) for every shop.
        $query = Shop::with(['neighborhood', 'products' => function($q) use ($search, $likeOp) {
            $q->select('id', 'shop_id', 'name', 'price', 'images');
            if ($search) {
                $q->where('name', $likeOp, "%{$search}%");
            }
        }]);

        if ($search) {
            // Filter shops that have products matching the search OR match the shop name
            $query->where(function($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, "%{$search}%")
                  ->orWhereHas('products', function($pq) use ($search, $likeOp) {
                      $pq->where('name', $likeOp, "%{$search}%");
                  });
            });
        }

        // Only include approved shops that have valid coordinates
        $query->where('status', 'approved')
              ->whereNotNull('latitude')
              ->whereNotNull('longitude');

        // Cap the unfiltered load (initial map view); a search narrows the result
        // set naturally, so only limit when browsing without one.
        if (!$search) {
            $query->limit(300);
        }

        $shops = $query->get()->map(function($shop) {
            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'address' => $shop->neighborhood->name ?? 'Lomé',
                'coordinates' => [
                    'lat' => (float)$shop->latitude,
                    'lng' => (float)$shop->longitude
                ],
                'image' => $shop->logo 
                    ? (str_starts_with($shop->logo, 'http') 
                        ? $shop->logo 
                        : (str_starts_with($shop->logo, '/') 
                            ? asset($shop->logo) 
                            : (str_starts_with($shop->logo, 'images/') 
                                ? asset($shop->logo) 
                                : asset('storage/' . $shop->logo)))) 
                    : 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=400&q=80',
                'matching_products' => $shop->products,
                // For the UI, we show the cheapest matching product's price as a starting price
                'price' => $shop->products->isNotEmpty() ? 'À partir de ' . number_format((float)$shop->products->min('price'), 0, ',', ' ') . ' FCFA' : 'Voir catalogue'
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
            'kyc_document_type' => 'required|in:rccm,cni',
            'kyc_document' => 'required|mimes:jpg,jpeg,png,pdf|max:2048',
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

        $documentPath = $request->file('kyc_document')->store(
            $validated['kyc_document_type'] === 'rccm' ? 'kyc/licenses' : 'kyc/id_cards',
            's3'
        );

        $shop->update([
            'kyc_document_type' => $validated['kyc_document_type'],
            'license_path' => $validated['kyc_document_type'] === 'rccm' ? $documentPath : null,
            'id_card_path' => $validated['kyc_document_type'] === 'cni' ? $documentPath : null,
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

    /**
     * Update KYC documents for the shop.
     */
    public function updateKYC(Request $request)
    {
        $request->validate([
            'id_card' => 'nullable|mimes:jpg,jpeg,png,pdf|max:2048',
            'license' => 'nullable|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $shop = Auth::user()->shop;
        if (!$shop) return back()->with('error', 'Boutique non trouvée.');

        if ($request->hasFile('id_card')) {
            $shop->id_card_path = $request->file('id_card')->store('kyc/id_cards', 's3');
            $shop->kyc_document_type = 'cni';
            $shop->is_verified = false;
        }

        if ($request->hasFile('license')) {
            $shop->license_path = $request->file('license')->store('kyc/licenses', 's3');
            $shop->kyc_document_type = 'rccm';
            $shop->is_verified = false;
        }

        $shop->save();

        return back()->with('success', 'Documents KYC mis à jour. L\'admin les examinera bientôt.');
    }
}
