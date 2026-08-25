<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Speeds up the accent-insensitive product search in ProductController::index,
// which does an unbounded ilike scan over the whole products table. unaccent()
// is STABLE (not IMMUTABLE), so Postgres won't allow it directly in an index
// expression — the wrapper function below marks it IMMUTABLE so it can be indexed.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');

        DB::statement(<<<'SQL'
            CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text AS $$
                SELECT public.unaccent('public.unaccent'::regdictionary, $1)
            $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE
        SQL);

        DB::statement('CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON products USING gin (immutable_unaccent(name) gin_trgm_ops)');
        DB::statement('CREATE INDEX IF NOT EXISTS products_description_trgm_idx ON products USING gin (immutable_unaccent(description) gin_trgm_ops)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS products_name_trgm_idx');
        DB::statement('DROP INDEX IF EXISTS products_description_trgm_idx');
        DB::statement('DROP FUNCTION IF EXISTS immutable_unaccent(text)');
        DB::statement('DROP EXTENSION IF EXISTS pg_trgm');
    }
};
