<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Postgres, unlike MySQL, does not auto-index foreignId()->constrained() columns.
// Every column below is filtered on directly in a hot controller path (dashboards,
// checkout, seller/driver/admin lists) and was hitting a sequential scan on the
// remote Supabase DB.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index('shop_id');
            $table->index('category_id');
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('neighborhood_id');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('parent_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('payment_reference');
            $table->index(['shop_id', 'status']);
            $table->index(['driver_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('product_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('order_id');
            $table->index('product_id');
            $table->index('driver_id');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->index('shop_id');
            $table->index('status');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('order_id');
            $table->index('withdrawal_id');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index('sender_id');
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->index('product_id');
            $table->index('order_id');
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('shop_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'driver_status']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['shop_id']);
            $table->dropIndex(['category_id']);
        });

        Schema::table('shops', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['neighborhood_id']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex(['parent_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['payment_reference']);
            $table->dropIndex(['shop_id', 'status']);
            $table->dropIndex(['driver_id', 'status']);
            $table->dropIndex(['status', 'created_at']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['order_id']);
            $table->dropIndex(['product_id']);
            $table->dropIndex(['driver_id']);
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropIndex(['shop_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['order_id']);
            $table->dropIndex(['withdrawal_id']);
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['conversation_id']);
            $table->dropIndex(['sender_id']);
        });

        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropIndex(['product_id']);
            $table->dropIndex(['order_id']);
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['shop_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'driver_status']);
        });
    }
};
