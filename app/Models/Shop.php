<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Shop extends Model
{
    protected $fillable = [
        'user_id', 'neighborhood_id', 'name', 'slug', 'description',
        'logo', 'cover_image', 'latitude', 'longitude', 'slogan',
        'phone', 'categories', 'delivery_available', 'delivery_fee',
        'coverage_area', 'balance', 'status', 'is_verified',
        'id_card_path', 'license_path', 'admin_note'
    ];

    protected $appends = ['id_card_url', 'license_url'];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'delivery_available' => 'boolean',
            'delivery_fee' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }

    public function getIdCardUrlAttribute(): ?string
    {
        return $this->id_card_path ? Storage::disk('s3')->url($this->id_card_path) : null;
    }

    public function getLicenseUrlAttribute(): ?string
    {
        return $this->license_path ? Storage::disk('s3')->url($this->license_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function neighborhood()
    {
        return $this->belongsTo(Neighborhood::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function reviews()
    {
        return $this->hasManyThrough(Review::class, Product::class, 'shop_id', 'product_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }
}
