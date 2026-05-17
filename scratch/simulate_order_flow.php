<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use App\Models\Shop;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Transaction;

echo "\n============================================\n";
echo "       LOMÉSHOP ORDER LIFE-CYCLE SIMULATOR    \n";
echo "============================================\n\n";

// 1. Setup participants
$client = User::where('role', 'client')->first() ?? User::find(3);
$seller = User::where('role', 'seller')->first() ?? User::find(19);
$shop = Shop::where('user_id', $seller->id)->first() ?? Shop::find(2);
$driver = User::where('role', 'driver')->where('driver_status', 'available')->first() ?? User::find(10);
$product = Product::where('shop_id', $shop->id)->first();

if (!$client || !$seller || !$shop || !$driver || !$product) {
    echo "❌ Error: Cannot run simulation. Ensure client, seller, shop, driver, and products exist.\n";
    exit(1);
}

echo "👥 PARTICIPANTS:\n";
echo "🛒 Client: {$client->name} (Email: {$client->email})\n";
echo "🏪 Seller Shop: {$shop->name} (Owner: {$seller->name}, Balance: {$shop->balance} FCFA)\n";
echo "📦 Product: {$product->name} (Price: {$product->price} FCFA)\n";
echo "🛵 Driver: {$driver->name} (Email: {$driver->email}, Status: {$driver->driver_status})\n\n";

// -------------------------------------------------------------
echo "🎬 PHASE 1: CLIENT CREATES ORDER (SUCCESSFUL CHECKOUT)\n";
// -------------------------------------------------------------
$totalAmount = $product->price;
$commissionAmount = $totalAmount * 0.10;
$sellerAmount = $totalAmount - $commissionAmount;
$paymentReference = 'PAY-' . strtoupper(Str::random(12));
$deliveryCode = rand(1000, 9999);

$order = Order::create([
    'user_id' => $client->id,
    'shop_id' => $shop->id,
    'order_number' => 'CMD-' . strtoupper(Str::random(8)),
    'total_amount' => $totalAmount,
    'commission_amount' => $commissionAmount,
    'seller_amount' => $sellerAmount,
    'status' => 'pending',
    'delivery_address' => 'Assigamé, Lomé, Togo',
    'payment_method' => 'Flooz/T-Money',
    'payment_reference' => $paymentReference,
    'delivery_code' => $deliveryCode,
]);

OrderItem::create([
    'order_id' => $order->id,
    'product_id' => $product->id,
    'quantity' => 1,
    'price' => $product->price,
]);

// Mark as paid
$order->update(['status' => 'paid']);
event(new \App\Events\OrderUpdated($order));

echo "✅ Order Created Successfully!\n";
echo "👉 Order Number: {$order->order_number}\n";
echo "👉 Status: {$order->status} (Paid)\n";
echo "👉 Total Amount: {$order->total_amount} FCFA\n";
echo "👉 Seller Net: {$order->seller_amount} FCFA | Commission (10%): {$order->commission_amount} FCFA\n";
echo "👉 Client OTP Delivery Code: {$order->delivery_code}\n\n";
sleep(2);

// -------------------------------------------------------------
echo "🎬 PHASE 2: SELLER ACCEPTS & STARTS PREPARING ORDER\n";
// -------------------------------------------------------------
echo "🏪 Seller is accepting the order and moving to 'preparing'...\n";
$order->update(['status' => 'preparing']);
event(new \App\Events\OrderUpdated($order));

// Trigger Delivery Assignment Service to notify available drivers
echo "📢 Triggering Delivery Assignment Service to broadcast availability...\n";
$assignmentService = new \App\Services\DeliveryAssignmentService();
$assignmentService->assignClosestDriver($order);

echo "✅ Order Status Updated: {$order->status}\n";
echo "📢 Notifications sent to drivers, and real-time event broadcasted!\n\n";
sleep(2);

// -------------------------------------------------------------
echo "🎬 PHASE 3: DRIVER ACCEPTS THE DELIVERY MISSION\n";
// -------------------------------------------------------------
echo "🛵 Driver '{$driver->name}' accepts the mission...\n";

// Mark driver as busy and assign to order
$driver->update(['driver_status' => 'busy']);
$order->update([
    'driver_id' => $driver->id,
    'status' => 'accepted'
]);

// Send notification to Client & Seller
$order->user->notify(new \App\Notifications\OrderNotification(
    $order, 
    "Votre commande #{$order->order_number} est en préparation.",
    'info'
));
$order->shop->user->notify(new \App\Notifications\OrderNotification(
    $order, 
    "Un livreur est en route pour récupérer la commande #{$order->order_number}.",
    'success'
));

event(new \App\Events\OrderUpdated($order));

echo "✅ Order Accepted by Driver!\n";
echo "👉 Order Status: {$order->status}\n";
echo "👉 Driver Assigned: {$driver->name}\n";
echo "🛵 Driver Status: {$driver->driver_status} (Busy)\n\n";
sleep(2);

// -------------------------------------------------------------
echo "🎬 PHASE 4: DRIVER PICKS UP ORDER (SHIPPED & LIVE TRACKING START)\n";
// -------------------------------------------------------------
echo "🛵 Driver picked up the package from the shop. Status set to 'shipped'...\n";

$order->update([
    'status' => 'shipped',
    'picked_up_at' => now()
]);

// Notify client
$order->user->notify(new \App\Notifications\OrderNotification(
    $order, 
    "Votre commande #{$order->order_number} est en route !",
    'info'
));

event(new \App\Events\OrderUpdated($order));

echo "✅ Order is Shipped!\n";
echo "👉 Order Status: {$order->status} (En route)\n";
echo "👉 Picked Up At: {$order->picked_up_at}\n";
echo "🌐 Live tracking channel active! Client is viewing route in real-time...\n\n";
sleep(2);

// -------------------------------------------------------------
echo "🎬 PHASE 5: DRIVER DELIVERS ORDER & CLIENT VERIFIES OTP\n";
// -------------------------------------------------------------
echo "🛵 Driver arrived at client's address.\n";
echo "🔑 Verifying OTP Delivery Code with customer: Inputting '{$deliveryCode}'...\n";

if ($deliveryCode != $order->delivery_code) {
    echo "❌ Verification failed: Code mismatch!\n";
    exit(1);
}

echo "✅ OTP Code Correct! Delivery confirmed!\n";

// Update order status to delivered
$order->update([
    'status' => 'delivered',
    'delivered_at' => now()
]);

// Record transaction for seller
$transaction = Transaction::create([
    'user_id' => $shop->user_id,
    'order_id' => $order->id,
    'amount' => $order->seller_amount,
    'type' => 'credit',
    'description' => "Vente - Commande #{$order->order_number}",
    'status' => 'completed'
]);

// Increment shop balance
$shop->increment('balance', $order->seller_amount);

// Increment driver stats and set driver available
$driver->increment('deliveries_completed');
$driver->update(['driver_status' => 'available']);

// Notify parties
$order->shop->user->notify(new \App\Notifications\OrderNotification(
    $order, 
    "La commande #{$order->order_number} a été livrée avec succès.",
    'success'
));
$order->user->notify(new \App\Notifications\OrderNotification(
    $order, 
    "Merci ! Votre commande #{$order->order_number} a été livrée avec succès.",
    'success'
));

event(new \App\Events\OrderUpdated($order));

echo "\n🎉 ORDER COMPLETED SUCCESSFULLY!\n";
echo "👉 Order Status: {$order->status} (Delivered)\n";
echo "👉 Delivered At: {$order->delivered_at}\n";
echo "👉 Transaction Created: ID {$transaction->id} (+{$transaction->amount} FCFA)\n";
echo "🛵 Driver '{$driver->name}' status: {$driver->driver_status} (Available, Completed: {$driver->deliveries_completed})\n";

// Retrieve fresh shop details to verify balance synchronicity
$freshShop = Shop::find($shop->id);
echo "🏪 New Seller Wallet Balance: {$freshShop->balance} FCFA\n\n";

echo "============================================\n";
echo "         SIMULATION COMPLETED SUCCESSFULLY!  \n";
echo "============================================\n";
