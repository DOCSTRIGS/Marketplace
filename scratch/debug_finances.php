<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Shop;
use App\Models\Order;
use App\Models\Transaction;

$shop = Shop::first();
$thisMonth = now()->startOfMonth();

$totalVolume = Order::where('shop_id', $shop->id)
    ->where('created_at', '>=', $thisMonth)
    ->sum('total_amount');

$totalSellerAmount = Order::where('shop_id', $shop->id)
    ->where('created_at', '>=', $thisMonth)
    ->sum('seller_amount');

$transactionsSum = Transaction::where('user_id', $shop->user_id)
    ->where('type', 'credit')
    ->where('created_at', '>=', $thisMonth)
    ->sum('amount');

echo "Shop: " . $shop->name . " (User ID: " . $shop->user_id . ")\n";
echo "Total Volume (Orders Created This Month): " . $totalVolume . "\n";
echo "Total Seller Amount (Orders Created This Month): " . $totalSellerAmount . "\n";
echo "Transactions Sum (Credits created This Month): " . $transactionsSum . "\n";
echo "Commission calculated as (Vol - TransactionsSum): " . ($totalVolume - $transactionsSum) . "\n";
echo "Actual Commission on this month's orders (Vol - SellerAmount): " . ($totalVolume - $totalSellerAmount) . "\n";
