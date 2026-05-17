<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Shop;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\Withdrawal;

echo "--- SHOPS ---\n";
foreach (Shop::all() as $s) {
    echo "ID: {$s->id} | Name: {$s->name} | Balance: {$s->balance} | User ID: {$s->user_id}\n";
}

echo "\n--- ALL ORDERS ---\n";
foreach (Order::withTrashed()->with('shop')->get() as $o) {
    echo "ID: {$o->id} | Num: {$o->order_number} | Shop ID: {$o->shop_id} | Status: {$o->status} | Total: {$o->total_amount} | Seller: {$o->seller_amount} | Created: {$o->created_at}\n";
}

echo "\n--- ALL TRANSACTIONS ---\n";
foreach (Transaction::all() as $t) {
    echo "ID: {$t->id} | User ID: {$t->user_id} | Order ID: {$t->order_id} | Amount: {$t->amount} | Type: {$t->type} | Status: {$t->status} | Desc: {$t->description} | Created: {$t->created_at}\n";
}
