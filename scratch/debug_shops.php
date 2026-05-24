<?php

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Shop;
use App\Models\User;
use App\Models\Product;

echo "=== EXISTING SHOPS & SELLERS ===\n";
$shops = Shop::with('user')->get();
foreach ($shops as $shop) {
    $productCount = Product::where('shop_id', $shop->id)->count();
    echo "Shop ID: {$shop->id}\n";
    echo "  Shop Name: {$shop->name}\n";
    echo "  Shop Slug: {$shop->slug}\n";
    if ($shop->user) {
        echo "  Seller Name: {$shop->user->name}\n";
        echo "  Seller Email: {$shop->user->email}\n";
        echo "  Seller Role: {$shop->user->role}\n";
    } else {
        echo "  Seller: (NO USER ASSIGNED!)\n";
    }
    echo "  Products Count: {$productCount}\n";
    echo "  Shop Logo: {$shop->logo}\n";
    echo "-----------------------------------\n";
}

echo "\n=== SELLERS WITHOUT SHOPS ===\n";
$sellersWithoutShops = User::where('role', 'seller')
    ->whereDoesntHave('shop')
    ->get();
foreach ($sellersWithoutShops as $seller) {
    echo "User ID: {$seller->id} | Name: {$seller->name} | Email: {$seller->email}\n";
}
