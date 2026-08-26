<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Throwable;

trait NotifiesSafely
{
    /**
     * Run a non-critical side effect (broadcast, notification, email) without
     * letting a downstream outage (e.g. Reverb asleep) fail the whole request.
     */
    protected function safely(callable $callback, string $context, array $extra = []): void
    {
        try {
            $callback();
        } catch (Throwable $e) {
            // report() still sends this to Sentry/the configured error tracker (so a real
            // bug, e.g. a null relation, isn't silently downgraded to an ignorable log line) —
            // it's only the HTTP response that must not fail because of it.
            report($e);
            Log::warning($context, array_merge($extra, ['error' => $e->getMessage()]));
        }
    }
}
