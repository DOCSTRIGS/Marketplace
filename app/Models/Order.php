<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id', 
        'shop_id', 
        'order_number', 
        'total_amount', 
        'commission_amount', 
        'seller_amount', 
        'status', 
        'delivery_address', 
        'payment_method', 
        'driver_id', 
        'payment_reference',
        'kkiapay_transaction_id',
        'delivery_code'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
