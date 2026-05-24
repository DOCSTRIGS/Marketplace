<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check a few products to see image format
$products = App\Models\Product::take(5)->get(['id','name','images']);
foreach ($products as $p) {
    echo "ID: {$p->id} | Name: {$p->name}\n";
    echo "Images: " . json_encode($p->images) . "\n\n";
}

// Also check cart_items
echo "=== CART ITEMS ===\n";
$cartItems = App\Models\CartItem::take(5)->get();
foreach ($cartItems as $ci) {
    echo "product_id: {$ci->product_id} | product_name: {$ci->product_name}\n";
    echo "product_image: {$ci->product_image}\n\n";
}
