<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        } elseif ($user->role === 'seller') {
            return redirect()->route('seller.dashboard');
        } elseif ($user->role === 'driver') {
            return redirect()->route('driver.dashboard');
        }
        return redirect()->route('home');
    }
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

        Route::get('/inventory', [App\Http\Controllers\SellerController::class, 'inventory'])->name('inventory');
        Route::post('/inventory/{id}/restock', [App\Http\Controllers\SellerController::class, 'restock'])->name('inventory.restock');

        Route::get('/orders', [App\Http\Controllers\SellerController::class, 'orders'])->name('orders');
        Route::patch('/orders/{id}/status', [App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');
        Route::delete('/orders/{id}', [App\Http\Controllers\OrderController::class, 'destroy'])->name('orders.destroy');

        Route::get('/tracking', [App\Http\Controllers\SellerController::class, 'tracking'])->name('tracking');

        Route::get('/wallet', [App\Http\Controllers\WithdrawalController::class, 'sellerIndex'])->name('wallet');
        Route::post('/wallet/withdraw', [App\Http\Controllers\WithdrawalController::class, 'requestWithdrawal'])->name('wallet.withdraw');
        Route::get('/settings', [App\Http\Controllers\SellerController::class, 'settings'])->name('settings');
        Route::post('/settings', [App\Http\Controllers\SellerController::class, 'updateSettings'])->name('settings.update');
        Route::post('/kyc', [App\Http\Controllers\ShopController::class, 'updateKYC'])->name('kyc.update');
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


    // Cart Routes (cross-browser persistent cart)
    Route::prefix('api/cart')->name('cart.')->group(function () {
        Route::get('/',              [App\Http\Controllers\CartController::class, 'index'])->name('index');
        Route::post('/',             [App\Http\Controllers\CartController::class, 'store'])->name('store');
        Route::patch('/{productId}', [App\Http\Controllers\CartController::class, 'update'])->name('update');
        Route::delete('/{productId}',[App\Http\Controllers\CartController::class, 'destroy'])->name('destroy');
        Route::delete('/',           [App\Http\Controllers\CartController::class, 'clear'])->name('clear');
        Route::post('/sync',         [App\Http\Controllers\CartController::class, 'sync'])->name('sync');
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
    Route::post('/checkout/{reference}/confirm-payment', [App\Http\Controllers\CheckoutController::class, 'confirmPayment'])->name('checkout.confirmPayment');
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

    // Admin Driver Management
    Route::middleware(['auth'])->group(function () {
        Route::get('/admin/drivers', function() {
            return redirect()->route('admin.dashboard', ['tab' => 'drivers']);
        });
        Route::get('/admin/drivers/{driver}', [App\Http\Controllers\Admin\DriverController::class, 'show'])->name('admin.drivers.show');
        Route::post('/admin/drivers', [App\Http\Controllers\Admin\DriverController::class, 'store'])->name('admin.drivers.store');
        Route::patch('/admin/drivers/{driver}', [App\Http\Controllers\Admin\DriverController::class, 'update'])->name('admin.drivers.update');
        Route::get('/admin/drivers/fleet/positions', [App\Http\Controllers\Admin\DriverController::class, 'getFleetPositions'])->name('admin.drivers.fleet');
        Route::delete('/admin/drivers/{driver}', [App\Http\Controllers\Admin\DriverController::class, 'destroy'])->name('admin.drivers.destroy');
        
        // General User Management
        Route::post('/admin/users', [App\Http\Controllers\AdminController::class, 'storeUser'])->name('admin.users.store');
        Route::patch('/admin/users/{id}', [App\Http\Controllers\AdminController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('/admin/users/{id}', [App\Http\Controllers\AdminController::class, 'deleteUser'])->name('admin.users.delete');
        Route::get('/admin/finance', [App\Http\Controllers\AdminController::class, 'financialReport'])->name('admin.finance');
        Route::post('/admin/shops/{id}/verify', [App\Http\Controllers\AdminController::class, 'verifyKYC'])->name('admin.shops.verify');
    });

    // Review Routes
    Route::post('/orders/{order}/review', [App\Http\Controllers\ReviewController::class, 'store'])->name('orders.review.store');

    // Notification Routes
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Driver Simulation Route
    Route::post('/api/driver/update-location', [App\Http\Controllers\DriverController::class, 'updateLocation'])->name('driver.update-location');
    Route::post('/api/driver/sync-positions', [App\Http\Controllers\DriverController::class, 'syncPositions'])->name('driver.sync-positions');
    Route::post('/api/driver/update-status/{order}', [App\Http\Controllers\DriverController::class, 'updateStatus'])->name('driver.update-status');
    Route::get('/livreur/dashboard', [App\Http\Controllers\DriverController::class, 'dashboard'])->name('driver.dashboard');
    Route::get('/livreur/historique', [App\Http\Controllers\DriverController::class, 'history'])->name('driver.history');
    Route::get('/livreur/profil', [App\Http\Controllers\DriverController::class, 'profile'])->name('driver.profile');
    Route::post('/livreur/profil', [App\Http\Controllers\DriverController::class, 'updateProfile'])->name('driver.profile.update');
    Route::get('/livreur/commande/{order}', [App\Http\Controllers\DriverController::class, 'show'])->name('driver.tracking');
    Route::get('/orders/{order}/tracking', [App\Http\Controllers\OrderTrackingController::class, 'getDriverPosition'])->name('orders.tracking');
    Route::post('/livreur/commande/{order}/accept', [App\Http\Controllers\DriverController::class, 'acceptOrder'])->name('driver.orders.accept');
    Route::post('/livreur/commande/{order}/update-status', [App\Http\Controllers\DriverController::class, 'updateStatus'])->name('driver.orders.update-status');
    Route::post('/livreur/update-availability', [App\Http\Controllers\DriverController::class, 'updateAvailability'])->name('driver.update-availability');
});

// Public Routes
Route::get('/product/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('product.show');
Route::get('/map', [App\Http\Controllers\ShopController::class, 'mapData'])->name('map');

require __DIR__.'/auth.php';
