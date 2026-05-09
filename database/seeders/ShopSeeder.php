<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Neighborhood;
use App\Models\Shop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ShopSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Créer un quartier par défaut s'il n'existe pas
        $neighborhood = Neighborhood::firstOrCreate(
            ['name' => 'Aflao'],
            ['slug' => 'aflao']
        );

        // 2. Créer un utilisateur vendeur par défaut
        $user = User::firstOrCreate(
            ['email' => 'vendeur@lomehop.tg'],
            [
                'name' => 'Vendeur Demo',
                'password' => Hash::make('password'),
                'role' => 'seller'
            ]
        );

        // 3. Créer la boutique par défaut (ID 1)
        Shop::firstOrCreate(
            ['id' => 1],
            [
                'user_id' => $user->id,
                'neighborhood_id' => $neighborhood->id,
                'name' => 'Ma Boutique LoméShop',
                'slug' => 'ma-boutique-lome-shop',
                'description' => 'Boutique de démonstration pour le marketplace.',
                'latitude' => 6.1372,
                'longitude' => 1.2125,
            ]
        );
    }
}
