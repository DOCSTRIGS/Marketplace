import React from 'react';
import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

function Section({ title, children }) {
    return (
        <section className="mb-10">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">{title}</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
                {children}
            </div>
        </section>
    );
}

export default function Privacy() {
    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title="Politique de confidentialité" />
            <Navbar />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Politique de confidentialité</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-10">Dernière mise à jour : Juillet 2026</p>

                <Section title="1. Données collectées">
                    <p>Selon votre usage de la plateforme, LoméShop collecte :</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Vos identifiants de compte (nom, email, mot de passe chiffré, téléphone)</li>
                        <li>Votre adresse de livraison et, si vous l'autorisez, votre position GPS pour le suivi en temps réel</li>
                        <li>L'historique de vos commandes et de vos échanges avec les vendeurs (chat)</li>
                        <li>Pour les vendeurs : les documents de vérification d'identité (KYC) transmis lors de l'inscription de la boutique</li>
                        <li>Pour les livreurs : la position GPS pendant les livraisons actives</li>
                    </ul>
                </Section>

                <Section title="2. Utilisation des données">
                    <p>
                        Ces données sont utilisées exclusivement pour assurer le fonctionnement du service : traitement
                        des commandes, suivi de livraison, communication entre utilisateurs, prévention de la fraude, et
                        amélioration de la plateforme. Elles ne sont jamais vendues à des tiers.
                    </p>
                </Section>

                <Section title="3. Partage des données">
                    <p>
                        Vos informations de commande (nom, adresse de livraison, téléphone) sont partagées uniquement
                        avec le vendeur et le livreur concernés par votre commande, dans la stricte mesure nécessaire à
                        son exécution. Les paiements sont traités par notre prestataire de paiement partenaire, qui
                        applique ses propres mesures de sécurité.
                    </p>
                </Section>

                <Section title="4. Conservation des données">
                    <p>
                        Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression
                        de votre compte et de vos données associées à tout moment, sous réserve des obligations légales
                        de conservation (facturation, lutte contre la fraude).
                    </p>
                </Section>

                <Section title="5. Sécurité">
                    <p>
                        Les mots de passe sont chiffrés et ne sont jamais stockés en clair. Les communications avec la
                        plateforme sont sécurisées. Nous vous recommandons de ne jamais partager vos identifiants de
                        connexion.
                    </p>
                </Section>

                <Section title="6. Vos droits">
                    <p>
                        Vous pouvez à tout moment accéder à vos données, les corriger ou demander leur suppression
                        depuis votre profil, ou en nous contactant via le{' '}
                        <a href={route('help')} className="text-[#8B4513] underline font-semibold">Centre d'aide</a>.
                    </p>
                </Section>

                <Section title="7. Cookies">
                    <p>
                        LoméShop utilise des cookies techniques strictement nécessaires au fonctionnement du site
                        (session, préférence de thème clair/sombre, panier). Aucun cookie publicitaire tiers n'est
                        utilisé.
                    </p>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
