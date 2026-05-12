<x-mail::message>
# Merci pour votre commande !

Bonjour {{ $order->user->name }},

Nous avons bien reçu votre commande **#{{ $order->order_number }}** sur LoméShop.

**Détails de la commande :**
*   **Boutique :** {{ $order->shop->name }}
*   **Montant total :** {{ number_format($order->total_amount, 0, ',', ' ') }} FCFA
*   **Adresse de livraison :** {{ $order->delivery_address }}

Vous pouvez suivre l'avancement de votre livraison en temps réel via le lien ci-dessous.

<x-mail::button :url="route('tracking', ['order_id' => $order->id])">
Suivre ma commande
</x-mail::button>

Merci de votre confiance !

Cordialement,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
