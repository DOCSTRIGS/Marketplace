<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Neighborhood extends Model
{
    protected $fillable = ['name', 'slug'];

    public function shops()
    {
        return $this->hasMany(Shop::class);
    }
}
