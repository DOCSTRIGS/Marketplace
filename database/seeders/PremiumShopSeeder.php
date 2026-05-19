<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shop;
use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PremiumShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("Début du nettoyage de la base de données...");

        // 1. Désactivation temporaire des clés étrangères pour vider proprement les tables
        Schema::disableForeignKeyConstraints();

        \App\Models\Review::truncate();
        \App\Models\OrderItem::truncate();
        \App\Models\Order::truncate();
        \App\Models\Product::truncate();
        \App\Models\Withdrawal::truncate();
        \App\Models\Transaction::truncate();
        \App\Models\Shop::truncate();
        
        // Supprimer tous les anciens vendeurs pour repartir sur un état propre
        User::where('role', 'seller')->delete();

        $this->command->info("Base de données nettoyée avec succès !");

        // 2. Définition des 10 Boutiques de Prestige avec leurs coordonnées réelles à Lomé
        $premiumShopsData = [
            [
                'name' => 'Élégance Wax & Pagnes',
                'seller_email' => 'vendeur.pagne@lomeshop.com',
                'seller_name' => 'Afi Mensah',
                'neighborhood' => 'Bè', // Grand Marché (Assigamé)
                'latitude' => 6.1228,
                'longitude' => 1.2222,
                'description' => 'Créations artisanales en Wax de luxe, pagnes kita précieux et pièces uniques haut de gamme cousues main par nos maîtres tailleurs.'
            ],
            [
                'name' => 'Dékon High-Tech Center',
                'seller_email' => 'vendeur.tech@lomeshop.com',
                'seller_name' => 'Koffi Tech-Gourou',
                'neighborhood' => 'Nukafu', // Quartier Dékon
                'latitude' => 6.1345,
                'longitude' => 1.2188,
                'description' => 'Le hub de référence à Lomé pour vos smartphones de dernière génération, ordinateurs portables professionnels, accessoires connectés et garanties officielles.'
            ],
            [
                'name' => 'Électro-Élite Togo',
                'seller_email' => 'vendeur.electro@lomeshop.com',
                'seller_name' => 'Michel Lawson',
                'neighborhood' => 'Hédzranawoé',
                'latitude' => 6.1620,
                'longitude' => 1.2450,
                'description' => 'Appareils électroménagers premium pour la cuisine moderne. Produits importés d\'Europe, haute performance énergétique et garantis 24 mois.'
            ],
            [
                'name' => 'Aura Beauté Bio',
                'seller_email' => 'vendeur.beaute@lomeshop.com',
                'seller_name' => 'Yasmin Sika',
                'neighborhood' => 'Nukafu', // Nyékonakpoé
                'latitude' => 6.1302,
                'longitude' => 1.2054,
                'description' => 'Soins naturels capillaires et cutanés, huiles essentielles précieuses et maquillage bio haut de gamme formulés pour sublimer votre éclat au naturel.'
            ],
            [
                'name' => 'Saveurs & Terroir du Togo',
                'seller_email' => 'vendeur.saveurs@lomeshop.com',
                'seller_name' => 'Folly Agbota',
                'neighborhood' => 'Bè', // Hanoukopé
                'latitude' => 6.1288,
                'longitude' => 1.2140,
                'description' => 'Épices locales fines et rares, liqueurs artisanales togolaises (Sodabi infusé prestige), thés bio et délices gastronomiques de nos terroirs.'
            ],
            [
                'name' => 'L\'Atelier du Meuble Royal',
                'seller_email' => 'vendeur.meuble@lomeshop.com',
                'seller_name' => 'Emmanuel Tété',
                'neighborhood' => 'Agoè',
                'latitude' => 6.2050,
                'longitude' => 1.2210,
                'description' => 'Mobilier d\'exception fabriqué à la main à Lomé en bois précieux de teck et d\'iroko. Canapés chics, tables impériales et luminaires design.'
            ],
            [
                'name' => 'Lomé Sport & Vitalité',
                'seller_email' => 'vendeur.sport@lomeshop.com',
                'seller_name' => 'Pierre Adama',
                'neighborhood' => 'Hédzranawoé', // Tokoin
                'latitude' => 6.1480,
                'longitude' => 1.2260,
                'description' => 'Équipements de fitness haut de gamme, vêtements de sport techniques de marques internationales, chaussures de course de pointe et vélos de route.'
            ],
            [
                'name' => 'Auto-Prestige Togo',
                'seller_email' => 'vendeur.auto@lomeshop.com',
                'seller_name' => 'Serge Ananou',
                'neighborhood' => 'Adidogomé',
                'latitude' => 6.1750,
                'longitude' => 1.1680,
                'description' => 'Accessoires intérieurs en cuir véritable sur-mesure, produits d\'entretien carrosserie professionnels et pièces de rechange d\'origine constructeur.'
            ],
            [
                'name' => 'L\'Atelier des Jouets Éducatifs',
                'seller_email' => 'vendeur.jouets@lomeshop.com',
                'seller_name' => 'Bernadette Kolo',
                'neighborhood' => 'Agoè', // Klikamé
                'latitude' => 6.1820,
                'longitude' => 1.2010,
                'description' => 'Jouets d\'éveil et d\'apprentissage de haute qualité en bois noble non-toxique, puzzles 3D complexes et jeux de société familiaux innovants.'
            ],
            [
                'name' => 'Aromas & Bien-être',
                'seller_email' => 'vendeur.bienetre@lomeshop.com',
                'seller_name' => 'Dr. Diane Gbégnon',
                'neighborhood' => 'Bè', // Amoutivé
                'latitude' => 6.1260,
                'longitude' => 1.2185,
                'description' => 'Compléments alimentaires naturels certifiés, matériel d\'aromathérapie, diffuseurs ultrasoniques et huiles de massage professionnelles de relaxation.'
            ],
        ];

        foreach ($premiumShopsData as $data) {
            // 3. Création du compte utilisateur Vendeur
            $seller = User::create([
                'name' => $data['seller_name'],
                'email' => $data['seller_email'],
                'password' => Hash::make('password'), // Mot de passe générique simple
                'role' => 'seller',
            ]);

            // 4. Récupérer ou créer le Quartier associé
            $neighborhood = Neighborhood::firstOrCreate(
                ['name' => $data['neighborhood']],
                ['slug' => Str::slug($data['neighborhood'])]
            );

            // 5. Création de la boutique Premium
            Shop::create([
                'user_id' => $seller->id,
                'neighborhood_id' => $neighborhood->id,
                'name' => $data['name'],
                'slug' => Str::slug($data['name']),
                'description' => $data['description'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'status' => 'approved', // Immédiatement visible sur le site
                'is_verified' => true, // Badge officiel vérifié
                'balance' => 0, // Solde initial propre de 0 FCFA comme convenu
                'id_card_path' => 'mock/identity_card.pdf',
                'license_path' => 'mock/business_license.pdf',
                'admin_note' => 'Boutique premium certifiée d\'origine et validée officiellement par l\'équipe LoméShop.'
            ]);

            $this->command->line("Boutique créée : {$data['name']} ({$data['neighborhood']}) avec le vendeur {$data['seller_name']}.");
        }

        // 6. Réactivation obligatoire des contraintes de clés étrangères
        Schema::enableForeignKeyConstraints();

        $this->command->info("Succès ! Vos 10 boutiques de prestige avec un solde à 0 FCFA sont prêtes.");
    }
}
