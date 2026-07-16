<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateMysqlToPgsql extends Command
{
    protected $signature = 'db:migrate-mysql-to-pgsql {--fresh : Truncate destination tables before copying}';

    protected $description = 'Copy all application data from the mysql connection to the pgsql connection, in FK-safe order, and reset Postgres sequences.';

    /**
     * Parent tables first, so foreign keys always resolve on insert.
     * Reversed, this order is also safe for truncation (children first).
     */
    private array $tables = [
        'users',
        'categories',
        'neighborhoods',
        'shops',
        'products',
        'orders',
        'order_items',
        'reviews',
        'conversations',
        'messages',
        'withdrawals',
        'driver_logs',
        'transactions',
        'notifications',
        'cart_items',
        'stock_movements',
        'newsletter_subscribers',
    ];

    public function handle(): int
    {
        // The mysql and pgsql connections share the same DB_* env names by default,
        // so this command needs its own PGSQL_* vars to keep both connections open
        // at once without touching the main DB_* values used by the mysql connection.
        config([
            'database.connections.pgsql.host' => env('PGSQL_HOST', '127.0.0.1'),
            'database.connections.pgsql.port' => env('PGSQL_PORT', '5432'),
            'database.connections.pgsql.database' => env('PGSQL_DATABASE', 'marketplace'),
            'database.connections.pgsql.username' => env('PGSQL_USERNAME', 'postgres'),
            'database.connections.pgsql.password' => env('PGSQL_PASSWORD', ''),
        ]);

        $source = DB::connection('mysql');
        $dest = DB::connection('pgsql');

        if ($this->option('fresh')) {
            $this->info('Truncating destination tables...');
            foreach (array_reverse($this->tables) as $table) {
                $dest->table($table)->truncate();
            }
        }

        foreach ($this->tables as $table) {
            $count = $source->table($table)->count();

            if ($count === 0) {
                $this->line("  {$table}: 0 rows, skipping");
                continue;
            }

            $this->line("  {$table}: copying {$count} rows...");

            $source->table($table)->orderBy('id')->chunk(500, function ($rows) use ($dest, $table) {
                $dest->table($table)->insert(
                    $rows->map(fn ($row) => (array) $row)->all()
                );
            });

            // Skip tables whose "id" isn't a real integer sequence (e.g. the
            // standard Laravel notifications table uses a UUID primary key).
            $sequence = $dest->selectOne("SELECT pg_get_serial_sequence('{$table}', 'id') AS name")->name ?? null;
            if ($sequence) {
                $dest->statement(
                    "SELECT setval('{$sequence}', COALESCE((SELECT MAX(id) FROM \"{$table}\"), 1))"
                );
            }
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
