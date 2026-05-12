<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureShopIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->role === 'seller') {
            $shop = $request->user()->shop;
            
            // Allow access to logout, dashboard, settings and tracking to prevent loops or allow viewing empty state
            $excludedRoutes = ['seller.dashboard', 'logout', 'seller.settings', 'seller.settings.update', 'seller.tracking'];
            
            if (!$shop || $shop->status !== 'approved') {
                if (!in_array($request->route() ? $request->route()->getName() : null, $excludedRoutes)) {
                    return redirect()->route('seller.dashboard');
                }
            }
        }

        return $next($request);
    }
}
