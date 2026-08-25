<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $driverId;
    public $latitude;
    public $longitude;
    public $status;

    /**
     * Create a new event instance.
     */
    public function __construct($orderId, $latitude, $longitude, $driverId, $status)
    {
        $this->orderId = $orderId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->driverId = $driverId;
        $this->status = $status;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [new Channel('fleet')];

        if ($this->orderId) {
            $channels[] = new Channel('order.' . $this->orderId);
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'driver.location.updated';
    }
}
