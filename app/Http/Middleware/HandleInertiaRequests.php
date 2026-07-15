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
            'unreadMessagesCount' => (function() use ($request) {
                try {
                    return $request->user() ? $request->user()->unreadMessagesCount() : 0;
                } catch (\Exception $e) {
                    \Log::error('Error counting unread messages: ' . $e->getMessage());
                    return 0;
                }
            })(),
            'pendingOrdersCount' => (function() use ($request) {
                try {
                    return $request->user() ? $request->user()->pendingOrdersCount() : 0;
                } catch (\Exception $e) {
                    \Log::error('Error counting pending orders: ' . $e->getMessage());
                    return 0;
                }
            })(),
            'lowStockCount' => (function() use ($request) {
                try {
                    return $request->user() ? $request->user()->lowStockCount() : 0;
                } catch (\Exception $e) {
                    \Log::error('Error counting low stock products: ' . $e->getMessage());
                    return 0;
                }
            })(),
            'adminCounts' => [
                'pendingShops' => \App\Models\Shop::where('status', 'pending')->count(),
                'pendingWithdrawals' => \App\Models\Withdrawal::where('status', 'pending')->count(),
            ],
            'reviewStats' => (function() {
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
            })(),
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ];
    }
}
