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
            $table->string('driver_status')->default('offline')->after('role'); // offline, available, busy, pause
            $table->decimal('last_latitude', 10, 8)->nullable()->after('driver_status');
            $table->decimal('last_longitude', 11, 8)->nullable()->after('last_latitude');
            $table->timestamp('pause_started_at')->nullable()->after('last_longitude');
            $table->integer('deliveries_completed')->default(0)->after('pause_started_at');
            $table->timestamp('last_online_at')->nullable()->after('deliveries_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'driver_status',
                'last_latitude',
                'last_longitude',
                'pause_started_at',
                'deliveries_completed',
                'last_online_at'
            ]);
        });
    }
};
