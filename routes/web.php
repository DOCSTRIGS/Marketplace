<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/RoleSelection');
})->name('role.selection');

Route::get('/home', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/explore', [App\Http\Controllers\ProductController::class, 'index'])->name('explore');

Route::prefix('seller')->name('seller.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Seller/Dashboard');
    })->name('dashboard');
    
    Route::get('/tracking', function () {
        $order = \App\Models\Order::with(['orderItems.product', 'shop'])->first();

        // Extreme Fallback: Create a mock order if database is empty
        if (!$order) {
            $order = new \App\Models\Order([
                'order_number' => '#CMD-LOME-2024',
                'status' => 'Expédié',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $order->setRelation('shop', new \App\Models\Shop(['name' => 'Artisanat de Lomé']));
            $product = new \App\Models\Product(['name' => 'Sac en Cuir Artisanal']);
            $orderItem = new \App\Models\OrderItem();
            $orderItem->setRelation('product', $product);
            $order->setRelation('orderItems', collect([$orderItem]));
        }

        return Inertia::render('Tracking', [
            'order' => $order
        ]);
    })->name('tracking');

    Route::get('/products', [App\Http\Controllers\ProductController::class, 'sellerIndex'])->name('products');
    Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
    Route::post('/products/{id}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'sellerOrders'])->name('orders');
    Route::patch('/orders/{id}/status', [App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');

    Route::get('/wallet', function () {
        return Inertia::render('Seller/Wallet');
    })->name('wallet');

    Route::get('/settings', function () {
        return Inertia::render('Seller/Settings');
    })->name('settings');
});

Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store'])->name('orders.store');

Route::get('/product/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('product.show');

Route::get('/shops/create', [App\Http\Controllers\ShopController::class, 'create'])->name('shops.create');
Route::get('/map', [App\Http\Controllers\ShopController::class, 'mapData'])->name('map');
Route::post('/shops', [App\Http\Controllers\ShopController::class, 'store'])->name('shops.store');

Route::get('/tracking', function (Request $request) {
    $order = null;
    if ($request->has('order_id')) {
        $order = \App\Models\Order::with(['orderItems.product', 'shop'])->find($request->order_id);
    }
    
    // Demo Fallback: Try to get first real order
    if (!$order) {
        $order = \App\Models\Order::with(['orderItems.product', 'shop'])->first();
    }

    // Extreme Fallback: Create a mock order if database is empty
    if (!$order) {
        $order = new \App\Models\Order([
            'order_number' => '#CMD-LOME-2024',
            'status' => 'Expédié',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // Manually set relations for demo
        $order->setRelation('shop', new \App\Models\Shop(['name' => 'Artisanat de Lomé']));
        $product = new \App\Models\Product(['name' => 'Sac en Cuir Artisanal']);
        $orderItem = new \App\Models\OrderItem();
        $orderItem->setRelation('product', $product);
        $order->setRelation('orderItems', collect([$orderItem]));
    }

    return Inertia::render('Tracking', [
        'order' => $order
    ]);
})->name('tracking');



require __DIR__.'/auth.php';
