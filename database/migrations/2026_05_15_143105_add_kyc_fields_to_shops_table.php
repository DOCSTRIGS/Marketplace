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
            $table->boolean('is_verified')->default(false)->after('status');
            $table->string('id_card_path')->nullable()->after('is_verified');
            $table->string('license_path')->nullable()->after('id_card_path');
            $table->text('admin_note')->nullable()->after('license_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'id_card_path', 'license_path', 'admin_note']);
        });
    }
};
