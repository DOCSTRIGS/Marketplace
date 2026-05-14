<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['shop', 'user', 'driver']);
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('shop.' . $this->order->shop_id),
            new Channel('order.' . $this->order->id),
            new Channel('user.' . $this->order->user_id),
        ];
    }

    public function broadcastAs()
    {
        return 'order.updated';
    }
}
