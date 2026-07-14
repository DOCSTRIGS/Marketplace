<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'driver_status',
        'last_latitude',
        'last_longitude',
        'pause_started_at',
        'deliveries_completed',
        'last_online_at',
        'phone',
        'vehicle_type',
        'vehicle_model',
        'vehicle_plate',
        'vehicle_description',
        'vehicle_image',
        'license_image',
        'insurance_image',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'pause_started_at' => 'datetime',
            'last_online_at' => 'datetime',
        ];
    }

    public function isDriver()
    {
        return $this->role === 'driver';
    }

    public function isAvailable()
    {
        return $this->role === 'driver' && $this->driver_status === 'available';
    }

    public function shop()
    {
        return $this->hasOne(Shop::class);
    }

    public function shops()
    {
        return $this->hasMany(Shop::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function assignedOrders()
    {
        return $this->hasMany(Order::class, 'driver_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function receivedMessages()
    {
        // For a client, received messages are those where they are NOT the sender in their conversations
        return $this->hasManyThrough(Message::class, Conversation::class)
            ->where('messages.sender_id', '!=', $this->id);
    }

    public function unreadMessagesCount()
    {
        // If user is a seller, count how many UNIQUE CLIENTS have sent unread messages
        if ($this->role === 'seller' && $this->shop) {
            return Conversation::where('shop_id', $this->shop->id)
                ->whereHas('messages', function($q) {
                    $q->where('sender_id', '!=', $this->id)
                      ->whereNull('read_at');
                })->count();
        }

        // For clients, count how many UNIQUE SHOPS have sent unread messages
        return Conversation::where('user_id', $this->id)
            ->whereHas('messages', function($q) {
                $q->where('sender_id', '!=', $this->id)
                  ->whereNull('read_at');
            })->count();
    }

    public function pendingOrdersCount()
    {
        if ($this->role === 'seller' && $this->shop) {
            // Count all orders awaiting seller action:
            // pending (unpaid but created), paid (confirmed), processing/preparing (in progress)
            return Order::where('shop_id', $this->shop->id)
                ->whereIn('status', ['pending', 'paid', 'processing', 'preparing'])
                ->count();
        }
        return 0;
    }

    public function lowStockCount()
    {
        if ($this->role === 'seller' && $this->shop) {
            return \App\Models\Product::where('shop_id', $this->shop->id)
                ->where('stock', '<', 10)
                ->count();
        }
        return 0;
    }
}
