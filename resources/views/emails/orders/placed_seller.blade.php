<x-mail::message>
# Nouvelle commande reçue !

Bonjour {{ $order->shop->user->name }},

Une nouvelle commande a été passée dans votre boutique **{{ $order->shop->name }}**.

**Numéro de commande :** {{ $order->order_number }}
**Montant total :** {{ number_format($order->total_amount, 0, ',', ' ') }} FCFA
**Votre part (après commission) :** {{ number_format($order->seller_amount, 0, ',', ' ') }} FCFA

<x-mail::button :url="route('seller.orders')">
Voir la commande
</x-mail::button>

Merci de commencer la préparation dès que possible pour garantir la satisfaction du client.

Cordialement,<br>
L'équipe {{ config('app.name') }}
</x-mail::message>
