<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * GET /api/cart
     * Return all cart items for the authenticated user.
     */
    public function index()
    {
        $items = CartItem::where('user_id', Auth::id())->get();
        return response()->json($items);
    }

    /**
     * POST /api/cart
     * Add or update a product in the cart.
     * Body: { product_id, quantity }
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::with('shop')->findOrFail($request->product_id);

        $image = is_array($product->images) && count($product->images) > 0 ? $product->images[0] : null;

        $item = CartItem::updateOrCreate(
            [
                'user_id'    => Auth::id(),
                'product_id' => $product->id,
            ],
            [
                'quantity'      => $request->quantity,
                'product_name'  => $product->name,
                'product_price' => $product->price,
                'product_image' => $image,
                'shop_id'       => $product->shop_id,
                'shop_name'     => $product->shop?->name,
            ]
        );

        return response()->json($item, 201);
    }

    /**
     * PATCH /api/cart/{productId}
     * Update quantity of a specific cart item.
     */
    public function update(Request $request, $productId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $item = CartItem::where('user_id', Auth::id())
                        ->where('product_id', $productId)
                        ->firstOrFail();

        $item->update(['quantity' => $request->quantity]);

        return response()->json($item);
    }

    /**
     * DELETE /api/cart/{productId}
     * Remove a single item from the cart.
     */
    public function destroy($productId)
    {
        CartItem::where('user_id', Auth::id())
                ->where('product_id', $productId)
                ->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * DELETE /api/cart
     * Clear the entire cart for the authenticated user.
     */
    public function clear()
    {
        CartItem::where('user_id', Auth::id())->delete();
        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/cart/sync
     * Called on login to merge localStorage cart into DB.
     * Body: { items: [{ product_id, quantity }, ...] }
     */
    public function sync(Request $request)
    {
        $request->validate([
            'items'              => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $products = Product::with('shop')
            ->whereIn('id', collect($request->items)->pluck('product_id'))
            ->get()
            ->keyBy('id');

        foreach ($request->items as $row) {
            $product = $products->get($row['product_id']);
            if (!$product) continue;

            $image = is_array($product->images) && count($product->images) > 0 ? $product->images[0] : null;

            // updateOrCreate: if already in DB keep DB quantity, otherwise insert localStorage qty
            CartItem::firstOrCreate(
                [
                    'user_id'    => Auth::id(),
                    'product_id' => $product->id,
                ],
                [
                    'quantity'      => $row['quantity'],
                    'product_name'  => $product->name,
                    'product_price' => $product->price,
                    'product_image' => $image,
                    'shop_id'       => $product->shop_id,
                    'shop_name'     => $product->shop?->name,
                ]
            );
        }

        // Return the full merged cart
        return response()->json(
            CartItem::where('user_id', Auth::id())->get()
        );
    }
}
