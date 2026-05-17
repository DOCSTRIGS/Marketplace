<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Shop;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Withdrawal;

$shop = Shop::where('name', 'Engineer house')->first();

if ($shop) {
    echo "Cleaning shop: " . $shop->name . "\n";
    
    // Delete related data
    $orderCount = Order::where('shop_id', $shop->id)->delete();
    $transactionCount = Transaction::where('user_id', $shop->user_id)->delete();
    $withdrawalCount = Withdrawal::where('shop_id', $shop->id)->delete();
    
    // Reset balance
    $shop->update(['balance' => 0]);
    
    echo "Deleted orders: $orderCount\n";
    echo "Deleted transactions: $transactionCount\n";
    echo "Deleted withdrawals: $withdrawalCount\n";
    echo "Balance reset to 0.\n";
} else {
    echo "Shop 'Engineer house' not found.\n";
}
