import fs from 'fs';
import https from 'https';

const mermaidCode = `
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'background': '#ffffff',
    'primaryColor': '#F8FAFC',
    'primaryTextColor': '#000000',
    'lineColor': '#000000',
    'actorBorder': '#000000',
    'actorBkg': '#F1F5F9',
    'actorTextColor': '#000000',
    'noteBkgColor': '#FEF08A',
    'noteTextColor': '#000000',
    'noteBorderColor': '#000000'
  },
  'themeCSS': '
    .actor { font-size: 17pt !important; font-weight: bold !important; font-family: "Times New Roman", Times, serif !important; fill: #000000 !important; }
    .messageText { font-size: 15pt !important; font-weight: bold !important; font-family: "Times New Roman", Times, serif !important; fill: #000000 !important; }
    .noteText { font-size: 14pt !important; font-weight: bold !important; font-family: "Times New Roman", Times, serif !important; fill: #000000 !important; }
    .loopText { font-size: 14pt !important; font-weight: bold !important; font-family: "Times New Roman", Times, serif !important; fill: #000000 !important; }
    .sequenceNumber { font-size: 12pt !important; font-weight: bold !important; fill: #ffffff !important; }
    
    /* Solid black lines and arrows */
    .messageLine0, .messageLine1 { stroke: #000000 !important; stroke-width: 3px !important; }
    .actor-line { stroke: #000000 !important; stroke-width: 2.5px !important; }
    path { stroke: #000000 !important; stroke-width: 3px !important; }
    
    /* Solid black arrowheads */
    marker { fill: #000000 !important; stroke: #000000 !important; }
    #arrowhead, #crosshead, #sequencenumber { fill: #000000 !important; stroke: #000000 !important; }
    
    /* Boxes styling */
    rect.actor { stroke: #000000 !important; stroke-width: 2.5px !important; }
    .note { stroke: #000000 !important; stroke-width: 2.5px !important; }
    g.rect { fill: #000000 !important; }
  '
}%%
sequenceDiagram
    autonumber
    actor Client as Client (Acheteur)
    actor Vendeur as Vendeur (Commerçant)
    actor Livreur as Livreur (Prestige)
    participant Serveur as Serveur (Laravel)
    participant DB as Base de Données
    participant KkiaPay as KkiaPay

    Note over Client, Serveur: 1. CRÉATION DE LA COMMANDE
    Client->>Serveur: POST /api/orders
    Serveur->>DB: Vérifie le stock
    Serveur->>DB: Crée commande (pending, OTP)
    Serveur-->>Client: Réf. paiement & OTP
    Serveur-->>Vendeur: Notification e-mail & WebSocket

    Note over Client, KkiaPay: 2. PAIEMENT SÉCURISÉ (KKIAPAY)
    Client->>KkiaPay: Effectue le paiement mobile
    KkiaPay-->>Client: transaction_id généré
    Client->>Serveur: POST confirm-payment
    Serveur->>KkiaPay: Vérifie transaction
    KkiaPay-->>Serveur: Statut SUCCESS
    Serveur->>DB: Commande (paid) & décrémente stock
    Serveur-->>Client: Confirmation paiement

    Note over Vendeur, Livreur: 3. PRÉPARATION & ATTRIBUTION
    Vendeur->>Serveur: POST préparer commande
    Serveur->>DB: Commande (preparing)
    Serveur->>DB: Recherche livreur disponible
    Serveur-->>Livreur: Notification course
    Livreur->>Serveur: POST accepter course
    Serveur->>DB: Commande (accepted) & Livreur (busy)
    Serveur-->>Client: WebSocket (Livreur en route)

    Note over Livreur, Client: 4. LIVRAISON & SUIVI GPS
    Livreur->>Serveur: POST commande récupérée
    Serveur->>DB: Commande (shipped)
    Serveur-->>Client: WebSocket (Livreur en chemin)
    loop Suivi GPS en direct
        Livreur->>Serveur: POST position (lat, lng)
        Serveur->>DB: Enregistre position
        Serveur-->>Client: WebSocket (Mise à jour carte)
    end

    Note over Client, DB: 5. VALIDATION OTP & PORTAGE VENDEUR
    Livreur->>Client: Demande OTP
    Client->>Livreur: Fournit OTP (4 chiffres)
    Livreur->>Serveur: POST valider livraison (OTP)
    Serveur->>DB: Vérifie OTP
    Serveur->>DB: Commande (delivered)
    Serveur->>DB: Crédite solde boutique & crée transaction
    Serveur->>DB: Livreur (available)
    Serveur-->>Livreur: Livraison validée
    Serveur-->>Client: WebSocket (Livré !)
    Serveur-->>Vendeur: WebSocket (Solde crédité)
`;

// Encode code in url-safe base64
const base64Encoded = Buffer.from(mermaidCode, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // remove padding

const url = 'https://mermaid.ink/img/' + base64Encoded;
console.log('Fetching diagram from:', url);

const file = fs.createWriteStream('d:/xampp/htdocs/Marketplace/diagramme_sequence.png');

https.get(url, (response) => {
    if (response.statusCode !== 200) {
        console.error('Failed to generate image, status code:', response.statusCode);
        return;
    }
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Sequence diagram saved successfully as diagramme_sequence.png');
    });
}).on('error', (err) => {
    fs.unlink('d:/xampp/htdocs/Marketplace/diagramme_sequence.png', () => {});
    console.error('Error fetching image:', err.message);
});
