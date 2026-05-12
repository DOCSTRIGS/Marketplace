<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'amount',
        'status',
        'payment_method',
        'payment_details',
        'admin_note'
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
