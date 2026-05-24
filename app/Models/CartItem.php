<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'product_name',
        'product_price',
        'product_image',
        'shop_id',
        'shop_name',
    ];

    protected $casts = [
        'product_price' => 'float',
        'quantity'      => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
