import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

const FAQ_GROUPS = [
    {
        title: 'Commander',
        items: [
            {
                q: 'Comment passer une commande ?',
                a: "Parcourez les catégories ou utilisez la recherche pour trouver un produit, ajoutez-le au panier, puis validez votre commande en renseignant votre adresse de livraison. Le paiement se fait ensuite via T-Money, Flooz ou carte bancaire."
            },
            {
                q: "Qu'est-ce que le code de réception ?",
                a: "À la création de votre commande, un code à 4 chiffres vous est communiqué. Vous devez le transmettre au livreur au moment de la remise du colis : c'est la preuve que vous avez bien reçu votre commande."
            },
            {
                q: 'Comment suivre ma livraison en temps réel ?',
                a: "Depuis « Mes Commandes » ou « Tracking » dans le menu, vous pouvez suivre le trajet de votre livreur sur la carte en direct dès que votre commande est expédiée."
            },
            {
                q: 'Où trouver mon reçu de paiement ?',
                a: "Depuis « Mes Commandes », chaque commande payée dispose d'un bouton « Télécharger le reçu » qui génère un PDF récapitulatif à tout moment."
            },
        ],
    },
    {
        title: 'Vendre sur LoméShop',
        items: [
            {
                q: 'Comment ouvrir ma boutique ?',
                a: "Depuis la page d'accueil, choisissez le rôle « Vendeur », remplissez les informations de votre boutique et localisez-la sur la carte. Votre boutique passe ensuite en vérification avant d'être visible publiquement."
            },
            {
                q: "Pourquoi ma boutique est-elle « en attente » ?",
                a: "Chaque nouvelle boutique est examinée par notre équipe pour garantir la qualité de la plateforme. Ce délai est généralement de moins de 24h."
            },
            {
                q: 'Comment obtenir le badge « Vérifié » ?',
                a: "Depuis Paramètres > Certification Prestige, transmettez votre carte d'identité et un justificatif. Une fois validés par l'équipe LoméShop, le badge apparaît sur votre boutique."
            },
            {
                q: 'Comment fonctionne la commission ?',
                a: "LoméShop prélève une commission de 10% sur chaque vente, automatiquement au moment du paiement. Le reste du montant est crédité sur votre solde disponible une fois la commande livrée."
            },
            {
                q: 'Comment retirer mon argent ?',
                a: "Depuis Portefeuille, faites une demande de retrait (montant minimum 5 000 FCFA) vers Flooz ou T-Money. Elle est traitée par l'équipe LoméShop."
            },
        ],
    },
    {
        title: 'Livraison',
        items: [
            {
                q: 'Comment devenir livreur ?',
                a: "Contactez l'équipe LoméShop pour créer votre compte livreur. Vous devrez renseigner votre véhicule et vos documents (permis, assurance)."
            },
            {
                q: 'Que faire si un client est injoignable ?',
                a: "Utilisez le bouton d'appel direct sur votre commande active pour contacter le client depuis l'application."
            },
        ],
    },
    {
        title: 'Compte & sécurité',
        items: [
            {
                q: 'Comment changer mon mot de passe ?',
                a: "Rendez-vous dans votre profil (menu en haut à droite) puis « Mon Profil » ou « Paramètres » selon votre rôle, section « Changer le mot de passe »."
            },
            {
                q: 'Puis-je supprimer mon compte ?',
                a: "Oui, contactez-nous via ce centre d'aide pour toute demande de suppression de compte et de données."
            },
        ],
    },
];

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 py-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="font-bold text-sm text-gray-900 dark:text-white pr-4">{q}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-3">{a}</p>}
        </div>
    );
}

export default function Help() {
    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title="Centre d'aide" />
            <Navbar />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Centre d'aide</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">Les réponses aux questions les plus fréquentes sur LoméShop.</p>

                {FAQ_GROUPS.map(group => (
                    <section key={group.title} className="mb-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-[#8B4513] mb-4">{group.title}</h2>
                        <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-gray-800 px-6 shadow-sm">
                            {group.items.map(item => (
                                <FaqItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </section>
                ))}

                <div className="bg-[#8B4513]/5 dark:bg-[#8B4513]/10 rounded-2xl p-8 text-center">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Vous ne trouvez pas votre réponse ?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Contactez directement le vendeur concerné via la messagerie intégrée depuis sa boutique ou votre commande.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
