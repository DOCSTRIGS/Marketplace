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
    $products = \App\Models\Product::with(['shop.neighborhood', 'category', 'reviews'])
        ->whereHas('shop', function($q) {
            $q->where('status', 'approved');
        })
        ->inRandomOrder()->take(4)->get();
    
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
        Route::get('/dashboard', [App\Http\Controllers\SellerController::class, 'dashboard'])->name('dashboard');
        
        Route::get('/products', [App\Http\Controllers\SellerController::class, 'products'])->name('products');
        Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
        Route::post('/products/{id}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{id}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');

        Route::get('/orders', [App\Http\Controllers\SellerController::class, 'orders'])->name('orders');
        Route::patch('/orders/{id}/status', [App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');
        Route::delete('/orders/{id}', [App\Http\Controllers\OrderController::class, 'destroy'])->name('orders.destroy');

        Route::get('/tracking', [App\Http\Controllers\SellerController::class, 'tracking'])->name('tracking');

        Route::get('/wallet', [App\Http\Controllers\WithdrawalController::class, 'sellerIndex'])->name('wallet');
        Route::post('/wallet/withdraw', [App\Http\Controllers\WithdrawalController::class, 'requestWithdrawal'])->name('wallet.withdraw');
        Route::get('/settings', [App\Http\Controllers\SellerController::class, 'settings'])->name('settings');
        Route::post('/settings', [App\Http\Controllers\SellerController::class, 'updateSettings'])->name('settings.update');
        Route::get('/chat', [App\Http\Controllers\ChatController::class, 'shopConversations'])->name('chat');
    });

    // Admin Routes
    Route::prefix('admin')->name('admin.')->middleware(['role:admin'])->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\AdminController::class, 'dashboard'])->name('dashboard');
        Route::patch('/shops/{id}/status', [App\Http\Controllers\AdminController::class, 'updateShopStatus'])->name('shops.updateStatus');
        Route::post('/categories', [App\Http\Controllers\AdminController::class, 'storeCategory'])->name('categories.store');
        Route::post('/categories/{id}/subcategories', [App\Http\Controllers\AdminController::class, 'storeSubCategory'])->name('categories.storeSubCategory');
        Route::patch('/categories/{id}', [App\Http\Controllers\AdminController::class, 'updateCategory'])->name('categories.update');
        Route::delete('/categories/{id}', [App\Http\Controllers\AdminController::class, 'deleteCategory'])->name('categories.delete');
        Route::delete('/reviews/{id}', [App\Http\Controllers\AdminController::class, 'deleteReview'])->name('reviews.delete');
        Route::delete('/shops/{id}', [App\Http\Controllers\AdminController::class, 'deleteShop'])->name('shops.delete');
        Route::patch('/users/{id}/toggle-admin', [App\Http\Controllers\AdminController::class, 'toggleAdminRole'])->name('users.toggleAdmin');
        
        Route::get('/withdrawals', [App\Http\Controllers\WithdrawalController::class, 'adminIndex'])->name('withdrawals.index');
        Route::patch('/withdrawals/{id}/status', [App\Http\Controllers\WithdrawalController::class, 'updateStatus'])->name('withdrawals.updateStatus');
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
    Route::post('/checkout/fedapay', [App\Http\Controllers\CheckoutController::class, 'createTransaction'])->name('checkout.fedapay');
    Route::get('/checkout/{reference}/success', [App\Http\Controllers\CheckoutController::class, 'success'])->name('checkout.success');

    Route::get('/tracking', function (Request $request) {
        $order = null;
        if ($request->has('order_id')) {
            $order = \App\Models\Order::with(['orderItems.product', 'shop'])->find($request->order_id);
        }
        
        if (!$order) {
            $order = \App\Models\Order::with(['orderItems.product', 'shop'])
                ->where('user_id', auth()->id())
                ->latest()
                ->first();
        }

        return Inertia::render('Tracking', [
            'order' => $order
        ]);
    })->name('tracking');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public Routes
Route::get('/product/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('product.show');
Route::get('/map', [App\Http\Controllers\ShopController::class, 'mapData'])->name('map');

require __DIR__.'/auth.php';
