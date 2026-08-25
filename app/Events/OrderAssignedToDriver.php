<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderAssignedToDriver implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $driverId;

    public function __construct(Order $order, $driverId)
    {
        $this->order = $order->load(['shop', 'user']);
        $this->driverId = $driverId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('driver.' . $this->driverId),
            new Channel('shop.' . $this->order->shop_id),
        ];
    }

    public function broadcastAs()
    {
        return 'order.assigned';
    }
}
