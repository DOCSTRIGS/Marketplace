<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Get or create a conversation between the current user and a shop.
     */
    public function getOrCreate(Request $request, Shop $shop)
    {
        $authUser = Auth::user();

        // Security: a shop owner shouldn't start a conversation with their own shop as a client
        if ($authUser->id === $shop->user_id && $request->query('as') !== 'seller') {
             return redirect()->route('seller.chat');
        }

        $conversation = Conversation::firstOrCreate([
            'user_id' => $request->query('as') === 'seller'
                ? Conversation::where('shop_id', $shop->id)->value('user_id') ?? $authUser->id
                : $authUser->id,
            'shop_id' => $shop->id,
        ]);

        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();

        return Inertia::render('Chat/Conversation', [
            'conversation' => $conversation->load('shop'),
            'messages' => $messages,
            'authUser' => $authUser,
            'viewerRole' => $request->query('as') === 'seller' ? 'seller' : 'client',
        ]);
    }

    /**
     * API: Fetch messages for a conversation (used by seller inline chat).
     */
    public function getMessages(Request $request, Conversation $conversation)
    {
        // Security check
        $user = Auth::user();
        if ($user->id !== $conversation->user_id && $user->id !== $conversation->shop->user_id) {
            abort(403);
        }

        $messages = $conversation->messages()->with('sender')->orderBy('created_at')->get();
        return response()->json($messages);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $user->id,
            'content' => $validated['content'],
        ]);

        // Broadcast to Reverb WebSocket
        broadcast(new MessageSent($message))->toOthers();

        return response()->json(['message' => $message->load('sender')]);
    }

    /**
     * Get all conversations for the current user (client inbox).
     */
    public function myConversations(Request $request)
    {
        $user = Auth::user();

        $conversations = Conversation::where('user_id', $user->id)
            ->with(['shop', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->get();

        return Inertia::render('Chat/Inbox', [
            'conversations' => $conversations,
            'authUser' => $user,
        ]);
    }

    /**
     * Get all conversations for the seller's shop.
     */
    public function shopConversations(Request $request)
    {
        $user = Auth::user();
        $shop = $user->shop; // Assuming User hasOne Shop relation

        if (!$shop) {
            return redirect()->route('shops.create')->with('info', 'Vous devez créer une boutique pour accéder à la messagerie vendeur.');
        }

        $conversations = Conversation::where('shop_id', $shop->id)
            ->with(['user', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->latest()
            ->get();

        return Inertia::render('Chat/SellerInbox', [
            'conversations' => $conversations,
            'shop' => $shop,
            'authUser' => $user,
        ]);
    }
}
