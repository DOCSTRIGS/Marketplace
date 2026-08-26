<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Powers accent-insensitive search (e.g. "telephone" matching "téléphone")
// used by SearchController.
return new class extends Migration
{
    public function up(): void
    {
        // Supabase installs extensions into the "extensions" schema by default;
        // force public so unaccent()/its dictionary are reachable as public.unaccent.
        DB::statement('CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public');
    }

    public function down(): void
    {
        DB::statement('DROP EXTENSION IF EXISTS unaccent');
    }
};
