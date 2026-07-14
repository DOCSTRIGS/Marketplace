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

export default function Terms() {
    return (
        <div className="min-h-screen bg-[#FDF8F4] dark:bg-[#121212] flex flex-col font-sans transition-colors duration-300">
            <Head title="Conditions d'utilisation" />
            <Navbar />

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Conditions d'utilisation</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-10">Dernière mise à jour : Juillet 2026</p>

                <Section title="1. Objet">
                    <p>
                        LoméShop est une marketplace de proximité mettant en relation des artisans et commerçants locaux
                        (les « Vendeurs ») avec des acheteurs (les « Clients ») à Lomé, Togo. Les présentes conditions
                        régissent l'utilisation de la plateforme par tout utilisateur, quel que soit son rôle (client,
                        vendeur ou livreur).
                    </p>
                </Section>

                <Section title="2. Création de compte">
                    <p>
                        L'utilisation de certaines fonctionnalités (achat, vente, livraison) nécessite la création d'un
                        compte avec des informations exactes et à jour. Chaque utilisateur est responsable de la
                        confidentialité de ses identifiants et de toute activité effectuée depuis son compte.
                    </p>
                </Section>

                <Section title="3. Commandes et paiements">
                    <p>
                        Les commandes sont payées via les moyens proposés sur la plateforme (T-Money, Flooz, carte
                        bancaire). Une commande n'est considérée comme confirmée qu'après validation effective du
                        paiement par le prestataire de paiement. LoméShop prélève une commission sur chaque vente
                        réalisée par un vendeur, prélevée automatiquement au moment de la transaction.
                    </p>
                </Section>

                <Section title="4. Livraison">
                    <p>
                        Les livraisons sont assurées par des livreurs partenaires de la plateforme. Un code de
                        réception est communiqué au client à la création de la commande et doit être transmis au
                        livreur pour confirmer la remise du colis. LoméShop met en œuvre des moyens raisonnables pour
                        garantir des délais de livraison rapides, sans pouvoir garantir un délai fixe en toutes
                        circonstances (trafic, météo, disponibilité des livreurs).
                    </p>
                </Section>

                <Section title="5. Obligations des vendeurs">
                    <p>
                        Les vendeurs s'engagent à décrire fidèlement leurs produits, à maintenir leur stock à jour et à
                        honorer les commandes reçues. Les vendeurs doivent fournir des documents d'identification
                        valides dans le cadre du processus de vérification (KYC) pour obtenir le badge « Vérifié ».
                    </p>
                </Section>

                <Section title="6. Avis et modération">
                    <p>
                        Les avis ne peuvent être publiés que par un client ayant effectivement reçu sa commande.
                        LoméShop se réserve le droit de modérer ou supprimer tout avis contraire à la loi, diffamatoire
                        ou manifestement frauduleux.
                    </p>
                </Section>

                <Section title="7. Responsabilité">
                    <p>
                        LoméShop agit en tant qu'intermédiaire technique entre vendeurs, clients et livreurs. La
                        responsabilité de la conformité des produits vendus incombe au vendeur. LoméShop ne saurait
                        être tenu responsable des litiges directs entre utilisateurs, mais s'engage à faciliter leur
                        résolution via son support.
                    </p>
                </Section>

                <Section title="8. Modification des conditions">
                    <p>
                        LoméShop se réserve le droit de modifier les présentes conditions à tout moment. Les
                        utilisateurs seront informés de toute modification substantielle. La poursuite de l'utilisation
                        de la plateforme après modification vaut acceptation des nouvelles conditions.
                    </p>
                </Section>

                <Section title="9. Contact">
                    <p>
                        Pour toute question relative à ces conditions, vous pouvez nous contacter via le{' '}
                        <a href={route('help')} className="text-[#8B4513] underline font-semibold">Centre d'aide</a>.
                    </p>
                </Section>
            </main>

            <Footer />
        </div>
    );
}
