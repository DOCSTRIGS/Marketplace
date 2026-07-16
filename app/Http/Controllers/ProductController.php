<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category.parent', 'shop'])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->whereHas('shop', function($q) {
                $q->where('status', 'approved');
            });

        // Filter by Shop
        if ($request->filled('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        // Filter by Category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by Name or Description
        if ($request->filled('search')) {
            $search = $request->search;
            $likeOp = $query->getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $query->where(function($q) use ($search, $likeOp) {
                $q->where('name', $likeOp, "%{$search}%")
                  ->orWhere('description', $likeOp, "%{$search}%");
            });
        }

        // Filter by Price Range
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by Rating (using average): computed in its own grouped query so the
        // aggregate condition applies cleanly across database engines, then applied
        // to the main product query via a plain whereIn.
        if ($request->filled('rating')) {
            $qualifyingProductIds = \App\Models\Review::query()
                ->where('type', 'product')
                ->whereNotNull('product_id')
                ->select('product_id')
                ->groupBy('product_id')
                ->havingRaw('avg(rating) >= ?', [$request->rating])
                ->pluck('product_id');

            $query->whereIn('id', $qualifyingProductIds);
        }

        // A single shop's storefront catalog is naturally small, so it's returned in
        // full (the frontend derives its category filter from the complete list).
        // The general "browse everything" catalog has no such bound, so it's capped
        // to avoid an ever-growing unbounded query/payload as the marketplace grows.
        $products = $request->filled('shop_id')
            ? $query->latest()->get()
            : $query->latest()->take(200)->get();
        $categories = Category::whereNull('parent_id')->with('children')->get();

        $activeShop = null;
        if ($request->filled('shop_id')) {
            $activeShop = \App\Models\Shop::with('neighborhood')->find($request->shop_id);
        }

        return Inertia::render('Explore', [
            'products' => $products,
            'categories' => $categories,
            'activeShop' => $activeShop,
            // Casté en objet : un tableau PHP vide (aucun filtre actif) se sérialiserait
            // en JSON `[]` au lieu de `{}`, ce qui casse tout accès `filters.xxx` côté front.
            'filters' => (object) $request->only(['category_id', 'search', 'min_price', 'max_price', 'rating', 'shop_id', 'sort'])
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
            $product->images = [$this->uploadAndOptimizeImage($request->file('image'))];
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
            $product->images = [$this->uploadAndOptimizeImage($request->file('image'))];
        }

        $product->save();

        return redirect()->back()->with('success', 'Produit modifié avec succès');
    }

    private function uploadAndOptimizeImage($file)
    {
        $disk = Storage::disk('s3');
        $filename = 'images/products/' . time() . '_' . uniqid() . '.webp';

        // Try to optimize and convert using native PHP GD library
        try {
            $info = getimagesize($file->getRealPath());
            $mime = $info['mime'] ?? '';

            if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
                $image = imagecreatefromjpeg($file->getRealPath());
            } elseif ($mime === 'image/png') {
                $image = imagecreatefrompng($file->getRealPath());
                if ($image) {
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
            } elseif ($mime === 'image/webp') {
                $image = imagecreatefromwebp($file->getRealPath());
            } else {
                // If not supported, just upload the file as-is
                $imageName = 'images/products/' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $disk->put($imageName, file_get_contents($file->getRealPath()));
                return $disk->url($imageName);
            }

            if ($image) {
                // Resize if too large (Max 800px)
                $width = imagesx($image);
                $height = imagesy($image);
                $maxDim = 800;

                if ($width > $maxDim || $height > $maxDim) {
                    $ratio = $width / $height;
                    if ($ratio > 1) {
                        $newWidth = $maxDim;
                        $newHeight = round($maxDim / $ratio);
                    } else {
                        $newHeight = $maxDim;
                        $newWidth = round($maxDim * $ratio);
                    }

                    $resized = imagecreatetruecolor($newWidth, $newHeight);
                    if ($resized) {
                        if ($mime === 'image/png') {
                            imagealphablending($resized, false);
                            imagesavealpha($resized, true);
                            $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
                            imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
                        }

                        imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                        imagedestroy($image);
                        $image = $resized;
                    }
                }

                // Encode as WebP with 75% quality (excellent compression) straight into memory
                ob_start();
                imagewebp($image, null, 75);
                $data = ob_get_clean();
                imagedestroy($image);

                $disk->put($filename, $data);
                return $disk->url($filename);
            }
        } catch (\Exception $e) {
            // GD Error or not available: fallback below
        }

        // Standard fallback if GD fails
        $imageName = 'images/products/' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $disk->put($imageName, file_get_contents($file->getRealPath()));
        return $disk->url($imageName);
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
