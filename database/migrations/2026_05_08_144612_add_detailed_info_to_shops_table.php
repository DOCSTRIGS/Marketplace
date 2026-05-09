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
        Schema::table('shops', function (Blueprint $table) {
            $table->string('slogan')->nullable();
            $table->string('phone')->nullable();
            $table->json('categories')->nullable();
            $table->boolean('delivery_available')->default(false);
            $table->string('delivery_fee')->default('1500');
            $table->string('coverage_area')->default('Lomé et environs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['slogan', 'phone', 'categories', 'delivery_available', 'delivery_fee', 'coverage_area']);
        });
    }
};
