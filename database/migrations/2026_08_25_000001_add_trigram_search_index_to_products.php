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

        // On Supabase, unaccent may already be installed in the "extensions" schema
        // (its default). Move it to public so it matches public.unaccent below,
        // instead of erroring or silently leaving it out of reach.
        DB::statement(<<<'SQL'
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
                    CREATE EXTENSION unaccent WITH SCHEMA public;
                ELSIF NOT EXISTS (
                    SELECT 1 FROM pg_extension e
                    JOIN pg_namespace n ON n.oid = e.extnamespace
                    WHERE e.extname = 'unaccent' AND n.nspname = 'public'
                ) THEN
                    ALTER EXTENSION unaccent SET SCHEMA public;
                END IF;
            END $$;
        SQL);

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
