<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $driverId;
    public $latitude;
    public $longitude;

    /**
     * Create a new event instance.
     */
    public function __construct($orderId, $latitude, $longitude, $driverId = null)
    {
        $this->orderId = $orderId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->driverId = $driverId ?? (auth()->check() ? auth()->id() : null);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('order.' . $this->orderId),
            new Channel('fleet'),
        ];
    }

    public function broadcastAs()
    {
        return 'driver.location.updated';
    }
}
