<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Set only by CancelStalePendingOrders, to distinguish an order the
            // system auto-cancelled for lack of payment from one a seller/admin
            // deliberately cancelled — the latter must never be reopened by a
            // late KkiaPay confirmation. See CheckoutController::confirmPayment.
            $table->timestamp('auto_cancelled_at')->nullable()->after('kkiapay_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('auto_cancelled_at');
        });
    }
};
