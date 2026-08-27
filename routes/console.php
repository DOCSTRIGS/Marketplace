<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Sweeps abandoned/duplicate checkout attempts (see CancelStalePendingOrders)
// so they stop showing up as "available deliveries" to drivers.
Schedule::command('orders:cancel-stale')->everyFifteenMinutes()->withoutOverlapping();
