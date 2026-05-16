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
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->after('product_id')->constrained('users')->onDelete('cascade');
            $table->string('type')->default('product')->after('comment'); // 'product' or 'driver'
            $table->foreignId('product_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_id');
            $table->dropConstrainedForeignId('driver_id');
            $table->dropColumn('type');
        });
    }
};
