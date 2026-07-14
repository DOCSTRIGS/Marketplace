<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        NewsletterSubscriber::firstOrCreate(['email' => $validated['email']]);

        return response()->json(['message' => 'Merci ! Vous êtes bien inscrit(e) à la newsletter.']);
    }
}
