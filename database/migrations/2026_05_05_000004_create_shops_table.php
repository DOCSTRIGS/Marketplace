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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('neighborhood_id')->nullable()->constrained()->onDelete('restrict');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->string('id_card_path')->nullable();
            $table->string('license_path')->nullable();
            $table->text('admin_note')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('slogan')->nullable();
            $table->string('phone')->nullable();
            $table->json('categories')->nullable();
            $table->boolean('delivery_available')->default(false);
            $table->string('delivery_fee')->default('1500');
            $table->string('coverage_area')->default('Lomé et environs');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
