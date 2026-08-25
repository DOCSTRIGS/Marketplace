<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(\App\Models\Message $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $recipientId = $this->message->sender_id === $this->message->conversation->user_id 
            ? $this->message->conversation->shop->user_id 
            : $this->message->conversation->user_id;

        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
            new PrivateChannel('user.' . $recipientId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message->load('sender')
        ];
    }
}
