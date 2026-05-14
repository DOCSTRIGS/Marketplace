<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverLog extends Model
{
    protected $fillable = [
        'user_id',
        'event_type',
        'occurred_at',
        'metadata'
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'metadata' => 'json'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }}
