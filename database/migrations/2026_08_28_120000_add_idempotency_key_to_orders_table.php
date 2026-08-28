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
        Schema::table('orders', function (Blueprint $table) {
            // Identifie une même tentative de checkout côté client. Un panier peut
            // couvrir plusieurs boutiques : la clé est donc partagée par les 1..n
            // commandes issues du même clic "Confirmer & Payer" — elle n'est pas
            // unique en base. Elle sert à OrderController::store à renvoyer les
            // commandes déjà créées au lieu d'en dupliquer un jeu lors d'un
            // double-clic, d'un retry réseau ou d'une nouvelle tentative de paiement.
            $table->string('idempotency_key', 64)->nullable()->after('payment_reference');
            $table->index(['user_id', 'idempotency_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'idempotency_key']);
            $table->dropColumn('idempotency_key');
        });
    }
};
