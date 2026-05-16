<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a review for an order (Product + Driver)
     */
    public function store(Request $request, Order $order)
    {
        // 1. Security Check: Order must belong to user and be delivered
        if ($order->user_id !== Auth::id() || $order->status !== 'delivered') {
            return response()->json(['success' => false, 'message' => 'Action non autorisée.'], 403);
        }

        $request->validate([
            'reviews' => 'required|array',
            'reviews.*.type' => 'required|in:product,driver',
            'reviews.*.id' => 'required|integer', // product_id or driver_id
            'reviews.*.rating' => 'required|integer|min:1|max:5',
            'reviews.*.comment' => 'nullable|string|max:1000',
        ]);

        foreach ($request->reviews as $reviewData) {
            Review::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'order_id' => $order->id,
                    'type' => $reviewData['type'],
                    $reviewData['type'] === 'product' ? 'product_id' : 'driver_id' => $reviewData['id'],
                ],
                [
                    'rating' => $reviewData['rating'],
                    'comment' => $reviewData['comment'],
                ]
            );
        }

        return response()->json(['success' => true, 'message' => 'Merci pour votre avis !']);
    }
}
