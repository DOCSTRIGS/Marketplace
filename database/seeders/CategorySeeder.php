<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Électroménager' => ['Réfrigérateurs', 'Climatiseurs', 'Micro-ondes', 'Mixeurs', 'Fers à repasser'],
            'Électronique et High-Tech' => ['Téléphones', 'Ordinateurs', 'Tablettes', 'Télévisions', 'Accessoires'],
            'Mode et Habillement' => ['Vêtements Homme', 'Vêtements Femme', 'Chaussures', 'Pagnes Wax', 'Sacs & Accessoires'],
            'Beauté et Hygiène' => ['Soins du visage', 'Parfums', 'Maquillage', 'Soins capillaires', 'Produits bio'],
            'Maison et Décoration' => ['Meubles', 'Linge de maison', 'Éclairage', 'Décoration artisanale', 'Ustensiles'],
            'Alimentation et Boissons' => ['Produits locaux', 'Boissons', 'Conserves', 'Épices', 'Snacks'],
            'Santé et Bien-être' => ['Compléments alimentaires', 'Matériel médical', 'Massage', 'Huiles essentielles'],
            'Sports et Loisirs' => ['Équipement fitness', 'Vêtements sport', 'Matériel plein air', 'Vélos'],
            'Automobile et Accessoires' => ['Pièces détachées', 'Accessoires intérieurs', 'Entretien', 'Pneus'],
            'Jeux et Jouets' => ['Jeux éducatifs', 'Jouets en bois', 'Jeux de société', 'Peluches', 'Jeux vidéo']
        ];

        foreach ($categories as $mainCat => $subCats) {
            $parent = \App\Models\Category::create([
                'name' => $mainCat,
                'slug' => \Illuminate\Support\Str::slug($mainCat),
                'parent_id' => null
            ]);

            foreach ($subCats as $subCat) {
                \App\Models\Category::create([
                    'name' => $subCat,
                    'slug' => \Illuminate\Support\Str::slug($subCat),
                    'parent_id' => $parent->id
                ]);
            }
        }
    }
}
