<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category.parent', 'shop']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->latest()->get();
        $categories = Category::whereNull('parent_id')->with('children')->get();

        return Inertia::render('Explore', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id'])
        ]);
    }

    public function sellerIndex()
    {
        // Fallback for Demo/Testing without authentication
        $user = auth()->user();
        if (!$user) {
            $shop = \App\Models\Shop::first(); // Use first shop for demo
        } else {
            $shop = $user->shops()->first();
        }
        
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $shop = auth()->user()->shops()->first();
        if (!$shop) return redirect()->back()->with('error', 'Boutique non trouvée');

        $product = new Product();
        $product->name = $validated['name'];
        $product->slug = Str::slug($validated['name']) . '-' . time();
        $product->category_id = $validated['category_id'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];
        $product->stock = $validated['stock'];
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
        $shop = auth()->user()->shops()->first();
        $product = Product::where('id', $id)->where('shop_id', $shop->id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'stock' => 'required|integer',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $product->name = $validated['name'];
        $product->category_id = $validated['category_id'];
        $product->price = $validated['price'];
        $product->description = $validated['description'];
        $product->stock = $validated['stock'];

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
        $shop = auth()->user()->shops()->first();
        $product = Product::where('id', $id)->where('shop_id', $shop->id)->firstOrFail();
        $product->delete();

        return redirect()->back()->with('success', 'Produit supprimé avec succès');
    }


    public function show($id)
    {
        $product = Product::with(['category', 'shop.neighborhood'])->findOrFail($id);
        return Inertia::render('ProductDetail', [
            'product' => $product
        ]);
    }
}
