<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            // These counts each cost a DB round trip; only run the ones relevant
            // to the current user's role instead of unconditionally on every request.
            'unreadMessagesCount' => (function() use ($request) {
                if (!$request->user()) {
                    return 0;
                }
                try {
                    return $request->user()->unreadMessagesCount();
                } catch (\Exception $e) {
                    \Log::error('Error counting unread messages: ' . $e->getMessage());
                    return 0;
                }
            })(),
            'pendingOrdersCount' => (function() use ($request) {
                if ($request->user()?->role !== 'seller') {
                    return 0;
                }
                try {
                    return $request->user()->pendingOrdersCount();
                } catch (\Exception $e) {
                    \Log::error('Error counting pending orders: ' . $e->getMessage());
                    return 0;
                }
            })(),
            'lowStockCount' => (function() use ($request) {
                if ($request->user()?->role !== 'seller') {
                    return 0;
                }
                try {
                    return $request->user()->lowStockCount();
                } catch (\Exception $e) {
                    \Log::error('Error counting low stock products: ' . $e->getMessage());
                    return 0;
                }
            })(),
            // Only admins need these counts, so skip the two queries entirely for
            // every other visitor (guests, clients, sellers, drivers) — this ran
            // unconditionally on every single request before.
            'adminCounts' => (function() use ($request) {
                if ($request->user()?->role !== 'admin') {
                    return ['pendingShops' => 0, 'pendingWithdrawals' => 0];
                }
                return [
                    'pendingShops' => \App\Models\Shop::where('status', 'pending')->count(),
                    'pendingWithdrawals' => \App\Models\Withdrawal::where('status', 'pending')->count(),
                ];
            })(),
            // Same value for every visitor, so cache it instead of hitting the DB
            // on every single page load.
            'reviewStats' => \Illuminate\Support\Facades\Cache::remember('review_stats_product', 300, function () {
                try {
                    $productReviews = \App\Models\Review::where('type', 'product');
                    $count = (clone $productReviews)->count();
                    return [
                        'average' => round($count > 0 ? $productReviews->avg('rating') : 0, 1),
                        'count' => $count,
                    ];
                } catch (\Exception $e) {
                    return ['average' => 0, 'count' => 0];
                }
            }),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
