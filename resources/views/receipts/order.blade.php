<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu {{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #222222;
            margin: 0;
            padding: 40px;
        }
        .header {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 3px solid #8B4513;
            padding-bottom: 20px;
        }
        .header-left, .header-right {
            display: table-cell;
            vertical-align: top;
        }
        .header-right {
            text-align: right;
        }
        .brand {
            font-size: 26px;
            font-weight: bold;
            color: #8B4513;
        }
        .brand-sub {
            font-size: 10px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .doc-title {
            font-size: 18px;
            font-weight: bold;
            color: #222222;
            text-transform: uppercase;
        }
        .meta {
            font-size: 11px;
            color: #555555;
            margin-top: 4px;
        }
        .status-badge {
            display: inline-block;
            margin-top: 8px;
            padding: 4px 12px;
            border-radius: 12px;
            background-color: #E8F5E9;
            color: #2E7D32;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .parties {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .party {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .party-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #999999;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .party-name {
            font-size: 13px;
            font-weight: bold;
            color: #222222;
        }
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        table.items thead th {
            background-color: #F7F1EC;
            color: #8B4513;
            text-transform: uppercase;
            font-size: 9px;
            letter-spacing: 0.5px;
            padding: 10px 12px;
            text-align: left;
        }
        table.items thead th.right { text-align: right; }
        table.items tbody td {
            padding: 10px 12px;
            border-bottom: 1px solid #EFEFEF;
            font-size: 11px;
        }
        table.items tbody td.right { text-align: right; }
        .totals {
            width: 260px;
            margin-left: auto;
        }
        .totals-row {
            display: table;
            width: 100%;
            padding: 6px 0;
        }
        .totals-row .label {
            display: table-cell;
            color: #777777;
        }
        .totals-row .value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
        }
        .totals-row.grand .label,
        .totals-row.grand .value {
            font-size: 16px;
            color: #B03A2E;
            border-top: 2px solid #222222;
            padding-top: 10px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #EFEFEF;
            font-size: 9px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="brand">LoméShop</div>
            <div class="brand-sub">Votre marché local à Lomé</div>
        </div>
        <div class="header-right">
            <div class="doc-title">Reçu de paiement</div>
            <div class="meta">N° {{ $order->order_number }}</div>
            <div class="meta">{{ $order->created_at->translatedFormat('d F Y à H:i') }}</div>
            <div class="status-badge">{{ strtoupper($statusLabel) }}</div>
        </div>
    </div>

    <div class="parties">
        <div class="party">
            <div class="party-label">Client</div>
            <div class="party-name">{{ $order->user->name }}</div>
            <div>{{ $order->user->email }}</div>
            <div>{{ $order->delivery_address }}</div>
        </div>
        <div class="party">
            <div class="party-label">Vendu par</div>
            <div class="party-name">{{ $order->shop->name }}</div>
            @if($order->shop->phone)
                <div>{{ $order->shop->phone }}</div>
            @endif
        </div>
    </div>

    <table class="items">
        <thead>
            <tr>
                <th>Produit</th>
                <th class="right">Qté</th>
                <th class="right">Prix unitaire</th>
                <th class="right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->orderItems as $item)
                <tr>
                    <td>{{ $item->product->name ?? 'Produit' }}</td>
                    <td class="right">{{ $item->quantity }}</td>
                    <td class="right">{{ number_format($item->price, 0, ',', ' ') }} FCFA</td>
                    <td class="right">{{ number_format($item->price * $item->quantity, 0, ',', ' ') }} FCFA</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-row">
            <div class="label">Méthode de paiement</div>
            <div class="value">{{ $order->payment_method ?? 'N/A' }}</div>
        </div>
        <div class="totals-row">
            <div class="label">Référence de paiement</div>
            <div class="value">{{ $order->payment_reference ?? 'N/A' }}</div>
        </div>
        <div class="totals-row grand">
            <div class="label">Total payé</div>
            <div class="value">{{ number_format($order->total_amount, 0, ',', ' ') }} FCFA</div>
        </div>
    </div>

    <div class="footer">
        Merci pour votre confiance. LoméShop — La marketplace locale de Lomé, Togo.<br>
        Ce reçu a été généré automatiquement et fait office de preuve d'achat.
    </div>
</body>
</html>
