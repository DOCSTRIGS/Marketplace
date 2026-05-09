<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    protected $fillable = ['user_id', 'neighborhood_id', 'name', 'slug', 'description', 'logo', 'cover_image', 'latitude', 'longitude', 'slogan', 'phone', 'categories', 'delivery_available', 'delivery_fee', 'coverage_area'];

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

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
