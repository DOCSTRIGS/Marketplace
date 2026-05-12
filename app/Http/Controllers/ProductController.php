<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category.parent', 'shop', 'reviews'])
            ->whereHas('shop', function($q) {
                $q->where('status', 'approved');
            });

        // Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by Name or Description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by Price Range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by Rating (using average)
        if ($request->filled('rating')) {
            $query->whereHas('reviews', function($q) use ($request) {
                $q->select(\DB::raw('avg(rating)'))
                  ->groupBy('product_id')
                  ->havingRaw('avg(rating) >= ?', [$request->rating]);
            });
        }

        $products = $query->latest()->get();
        $categories = Category::whereNull('parent_id')->with('children')->get();

        return Inertia::render('Explore', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search', 'min_price', 'max_price', 'rating'])
        ]);
    }

    public function sellerIndex()
    {
        $user = Auth::user();
        $shop = $user->shop;
        
        if (!$shop) {
            return redirect()->route('shops.create')->with('error', 'Veuillez créer une boutique d\'abord.');
        }

        return Inertia::render('Seller/Products', [
            'products' => Product::where('shop_id', $shop->id)->with(['category.parent'])->latest()->get(),
            'categories' => Category::whereNotNull('parent_id')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'variants' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $shop = Auth::user()->shop;
        if (!$shop) return redirect()->back()->with('error', 'Boutique non trouvée');

        $product = new Product();
        $product->name = $validated['name'];
        $product->slug = Str::slug($validated['name']) . '-' . time();
        $product->category_id = $validated['category_id'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];
        $product->stock = $validated['stock'];
        $product->variants = $validated['variants'] ?? null;
        $product->shop_id = $shop->id;

        if ($request->hasFile('image')) {
            $imageName = time().'.'.$request->image->extension();  
            $request->image->move(public_path('images/products'), $imageName);
            $product->images = ['/images/products/'.$imageName];
        }

        $product->save();

        return redirect()->back()->with('success', 'Produit ajouté avec succès');
    }

    public function update(Request $request, $id)
    {
        $shop = Auth::user()->shop;
        $product = Product::where('id', $id)->where('shop_id', $shop->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'variants' => 'nullable|array',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $product->name = $validated['name'];
        $product->category_id = $validated['category_id'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];
        $product->stock = $validated['stock'];
        $product->variants = $validated['variants'] ?? null;

        if ($request->hasFile('image')) {
            $imageName = time().'.'.$request->image->extension();  
            $request->image->move(public_path('images/products'), $imageName);
            $product->images = ['/images/products/'.$imageName];
        }

        $product->save();

        return redirect()->back()->with('success', 'Produit modifié avec succès');
    }

    public function destroy($id)
    {
        $shop = Auth::user()->shop;
        $product = Product::where('id', $id)->where('shop_id', $shop->id)->firstOrFail();
        $product->delete();

        return redirect()->back()->with('success', 'Produit supprimé avec succès');
    }

    public function show($id)
    {
        $product = Product::with(['category', 'shop.neighborhood', 'reviews.user'])->findOrFail($id);
        return Inertia::render('ProductDetail', [
            'product' => $product
        ]);
    }
}
