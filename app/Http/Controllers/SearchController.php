<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function suggest(Request $request)
    {
        $term = trim((string) $request->query('q', ''));

        if ($term === '') {
            return response()->json(['categories' => [], 'products' => []]);
        }

        // unaccent() makes "telephone" match "téléphone" on both sides of the
        // comparison. Categories are few enough that a sequential scan is fine,
        // but products uses immutable_unaccent() so it hits the same trigram
        // index as the Explore search (this endpoint fires on every keystroke).
        $categories = Category::query()
            ->whereRaw('unaccent(name) ILIKE unaccent(?)', ["%{$term}%"])
            ->orderByRaw('unaccent(name) ILIKE unaccent(?) DESC', ["{$term}%"])
            ->limit(5)
            ->get(['id', 'name', 'slug']);

        $products = Product::query()
            ->where('status', '!=', 'inactive')
            ->whereHas('shop', fn ($q) => $q->where('status', 'approved'))
            ->whereRaw('immutable_unaccent(name) ILIKE immutable_unaccent(?)', ["%{$term}%"])
            ->orderByRaw('immutable_unaccent(name) ILIKE immutable_unaccent(?) DESC', ["{$term}%"])
            ->limit(5)
            ->with('category:id,name')
            ->get(['id', 'name', 'category_id', 'price', 'images']);

        return response()->json([
            'categories' => $categories,
            'products' => $products->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category_id' => $p->category_id,
                'category_name' => $p->category?->name,
                'price' => $p->price,
                'image' => $p->images[0] ?? null,
            ]),
        ]);
    }
}
