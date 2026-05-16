<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background-color: #FDF8F4; padding: 40px; text-align: center; border-bottom: 1px solid #f0f0f0; }
        .logo { font-size: 32px; font-weight: 900; letter-spacing: -1px; text-decoration: none; color: #333; }
        .logo span { color: #D35400; }
        .content { padding: 40px; }
        .order-id { color: #D35400; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
        h1 { font-size: 24px; font-weight: 900; margin: 10px 0 20px; color: #1a1a1a; }
        .summary { background: #FAF9F8; border-radius: 15px; padding: 25px; margin: 30px 0; border: 1px solid #f0f0f0; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .summary-label { color: #888; font-weight: bold; text-transform: uppercase; font-size: 10px; }
        .summary-value { font-weight: 800; color: #333; }
        .earnings { font-size: 18px; color: #27AE60; font-weight: 900; }
        .button { display: inline-block; padding: 16px 32px; background-color: #333; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
        .footer { padding: 30px; text-align: center; font-size: 11px; color: #aaa; background: #fafafa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="#" class="logo">Lomé<span>Shop</span></a>
        </div>
        <div class="content">
            <span class="order-id">Nouvelle Vente !</span>
            <h1>Bonne nouvelle, {{ $order->shop->user->name }} !</h1>
            <p>Une nouvelle commande vient d'être passée dans votre boutique <strong>{{ $order->shop->name }}</strong>.</p>
            
            <div class="summary">
                <div class="summary-item">
                    <span class="summary-label">Commande</span>
                    <span class="summary-value">#{{ $order->order_number }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Montant Total</span>
                    <span class="summary-value">{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</span>
                </div>
                <div class="summary-item" style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ddd;">
                    <span class="summary-label">Votre Gain Net</span>
                    <span class="summary-value earnings">{{ number_format($order->seller_amount, 0, ',', ' ') }} FCFA</span>
                </div>
            </div>

            <p style="text-align: center;">
                <a href="{{ route('seller.orders') }}" class="button">Gérer ma commande</a>
            </p>

            <p style="font-size: 13px; color: #666; margin-top: 30px;">
                <strong>Action requise :</strong> Merci de préparer le colis rapidement. Dès que vous cliquez sur "Prêt", le système cherchera automatiquement un livreur à proximité de votre boutique.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} LoméShop Marketplace. Tous droits réservés.<br>
            Ceci est un message automatique de votre espace vendeur.
        </div>
    </div>
</body>
</html>
