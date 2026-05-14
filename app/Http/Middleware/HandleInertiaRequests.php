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
        ];
    }
}
