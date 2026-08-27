<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class CancelStalePendingOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-stale';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel "pending" orders whose payment was never confirmed (abandoned checkout, or a duplicate created by a failed request) after a grace period, so they stop cluttering the driver\'s available-deliveries list.';

    /**
     * Grace period, in minutes, given to a pending order to be paid before
     * it's considered abandoned. Kkiapay's own widget times out well before this.
     */
    private const GRACE_PERIOD_MINUTES = 60;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // No kkiapay_transaction_id: the payment was never confirmed by
        // CheckoutController::confirmPayment, so nothing was ever debited
        // and no stock was ever decremented for these — safe to cancel outright.
        $staleOrders = Order::where('status', 'pending')
            ->whereNull('kkiapay_transaction_id')
            ->where('created_at', '<=', now()->subMinutes(self::GRACE_PERIOD_MINUTES))
            ->get(['id', 'order_number']);

        if ($staleOrders->isEmpty()) {
            $this->info('No stale pending orders found.');
            return self::SUCCESS;
        }

        // Re-apply the same conditions at UPDATE time: if CheckoutController::confirmPayment
        // marked one of these orders paid between the SELECT above and this UPDATE, its row
        // no longer matches (status/kkiapay_transaction_id changed) and is left untouched —
        // a confirmed payment can never be silently flipped back to "cancelled".
        $affected = Order::whereIn('id', $staleOrders->pluck('id'))
            ->where('status', 'pending')
            ->whereNull('kkiapay_transaction_id')
            ->update(['status' => 'cancelled', 'auto_cancelled_at' => now()]);

        // Report the rows actually affected by the UPDATE above, not the initial
        // SELECT — a row can drop out between the two (see comment above).
        $this->info("Cancelled {$affected} stale pending order(s) (out of {$staleOrders->count()} candidate(s)): "
            . $staleOrders->pluck('order_number')->implode(', '));

        return self::SUCCESS;
    }
}
