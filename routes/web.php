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
    $products = \App\Models\Product::with(['shop.neighborhood', 'category', 'reviews'])->inRandomOrder()->take(4)->get();
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'products' => $products,
    ]);
})->name('home');

Route::get('/explore', [App\Http\Controllers\ProductController::class, 'index'])->name('explore');

// Routes Authentifiées
Route::middleware(['auth'])->group(function () {
    // Seller Routes
    Route::prefix('seller')->name('seller.')->middleware(['role:seller'])->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Seller/Dashboard');
        })->name('dashboard');
        
        Route::get('/tracking', function () {
            $order = \App\Models\Order::where('shop_id', Auth::user()->shop?->id)
                ->with(['orderItems.product', 'shop'])
                ->latest()
                ->first();

            if (!$order) {
                return redirect()->route('seller.orders')->with('error', 'Aucune commande à suivre.');
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

        Route::get('/chat', [App\Http\Controllers\ChatController::class, 'shopConversations'])->name('chat');
    });

    // Client Routes
    Route::get('/my-orders', [App\Http\Controllers\OrderController::class, 'userOrders'])->name('orders.index');
    Route::post('/products/{product}/reviews', [App\Http\Controllers\ReviewController::class, 'store'])->name('reviews.store');
    
    Route::get('/chat/inbox', [App\Http\Controllers\ChatController::class, 'myConversations'])->name('chat.inbox');
    Route::get('/chat/shop/{shop}', [App\Http\Controllers\ChatController::class, 'getOrCreate'])->name('chat.show');
    Route::post('/chat/{conversation}/message', [App\Http\Controllers\ChatController::class, 'sendMessage'])->name('chat.send');
    Route::get('/chat/api/messages/{conversation}', [App\Http\Controllers\ChatController::class, 'getMessages'])->name('chat.messages');

    Route::get('/shops/create', [App\Http\Controllers\ShopController::class, 'create'])->name('shops.create');
    Route::post('/shops', [App\Http\Controllers\ShopController::class, 'store'])->name('shops.store');

    Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store'])->name('orders.store');
    Route::get('/checkout/delivery', [App\Http\Controllers\CheckoutController::class, 'delivery'])->name('checkout.delivery');
    Route::get('/checkout/{reference}', [App\Http\Controllers\CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('/checkout/process', [App\Http\Controllers\CheckoutController::class, 'process'])->name('checkout.process');
    Route::get('/checkout/{reference}/success', [App\Http\Controllers\CheckoutController::class, 'success'])->name('checkout.success');
});

// Public Routes
Route::get('/product/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('product.show');
Route::get('/map', [App\Http\Controllers\ShopController::class, 'mapData'])->name('map');

Route::get('/tracking', function (Request $request) {
    $order = null;
    if ($request->has('order_id')) {
        $order = \App\Models\Order::with(['orderItems.product', 'shop'])->find($request->order_id);
    }
    
    if (!$order) {
        $order = \App\Models\Order::with(['orderItems.product', 'shop'])->latest()->first();
    }

    if (!$order) {
        return redirect()->route('home')->with('error', 'Commande non trouvée.');
    }

    return Inertia::render('Tracking', [
        'order' => $order
    ]);
})->name('tracking');

require __DIR__.'/auth.php';
