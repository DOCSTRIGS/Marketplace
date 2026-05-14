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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('vehicle_type')->nullable()->after('last_online_at'); // moto, voiture, velo
            $table->string('vehicle_model')->nullable()->after('vehicle_type');
            $table->string('vehicle_plate')->nullable()->after('vehicle_model');
            $table->text('vehicle_description')->nullable()->after('vehicle_plate');
            $table->string('vehicle_image')->nullable()->after('vehicle_description');
            $table->string('license_image')->nullable()->after('vehicle_image'); // Permis
            $table->string('insurance_image')->nullable()->after('license_image'); // Assurance
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'vehicle_type',
                'vehicle_model',
                'vehicle_plate',
                'vehicle_description',
                'vehicle_image',
                'license_image',
                'insurance_image'
            ]);
        });
    }
};
