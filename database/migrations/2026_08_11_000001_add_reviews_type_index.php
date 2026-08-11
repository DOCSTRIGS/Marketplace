<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// reviews.type is filtered on every request (HandleInertiaRequests reviewStats)
// and on seller dashboards, but was missed by the earlier performance-indexes
// migration, causing a sequential scan on every page load. products.status is
// now filtered on in the main catalog browse query (ProductController::index).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->index('type');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });
    }
};
