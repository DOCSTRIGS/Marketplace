<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $conversation = \App\Models\Conversation::find($id);
    if (!$conversation) return false;

    // A user can listen if they are the client or the seller (via shop)
    return $user->id === $conversation->user_id || 
           $user->id === $conversation->shop->user_id;
});
