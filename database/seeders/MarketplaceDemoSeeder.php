<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shop;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Neighborhood;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MarketplaceDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create a Demo User if not exists
        $user = User::firstOrCreate(
            ['email' => 'josephettoh78@gmail.com'],
            [
                'name' => 'Joseph Ettoh',
                'password' => bcrypt('password'),
                'role' => 'client'
            ]
        );

        $driver = User::firstOrCreate(
            ['email' => 'livreur@lomeshop.com'],
            [
                'name' => 'Komi Livreur',
                'password' => bcrypt('password'),
                'role' => 'driver'
            ]
        );

        // 2. Ensure Neighborhoods exist
        $neighborhoods = ['Adidogomé', 'Agoè', 'Bè', 'Hédzranawoé', 'Nukafu'];
        foreach ($neighborhoods as $name) {
            Neighborhood::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
        $neighborIds = Neighborhood::pluck('id')->toArray();

        // 3. Create Categories if empty
        if (Category::count() == 0) {
            $tech = Category::create(['name' => 'Électronique', 'slug' => 'electronique']);
            Category::create(['name' => 'Smartphones', 'slug' => 'smartphones', 'parent_id' => $tech->id]);
            Category::create(['name' => 'Ordinateurs', 'slug' => 'ordinateurs', 'parent_id' => $tech->id]);
            
            $fashion = Category::create(['name' => 'Mode', 'slug' => 'mode']);
            Category::create(['name' => 'Vêtements', 'slug' => 'vetements', 'parent_id' => $fashion->id]);
            Category::create(['name' => 'Chaussures', 'slug' => 'chaussures', 'parent_id' => $fashion->id]);
        }
        $subCategories = Category::whereNotNull('parent_id')->get();

        // 4. Create some Shops with real Lomé GPS coordinates
        $shopData = [
            ['Lomé Tech Hub',        6.1328, 1.2152, 'Quartier Hédzranawoé'],
            ['Mode Africaine Plus',  6.1375, 1.2123, 'Grand Marché de Lomé'],
            ['Bazar du Centre',      6.1302, 1.2240, 'Quartier Bè'],
        ];

        $shops = [];
        foreach ($shopData as $index => [$name, $lat, $lng, $desc]) {
            $shops[] = Shop::firstOrCreate(
                ['name' => $name],
                [
                    'user_id' => $user->id,
                    'slug' => Str::slug($name),
                    'description' => "Bienvenue chez $name — $desc, Lomé.",
                    'neighborhood_id' => $neighborIds[array_rand($neighborIds)],
                    'latitude' => $lat,
                    'longitude' => $lng,
                ]
            );
        }

        // 5. Create some Products
        $productData = [
            ['iPhone 15 Pro', 'Le dernier iPhone avec processeur A17 Pro.', 850000],
            ['Samsung Galaxy S24', 'Performance et IA intégrée.', 650000],
            ['MacBook Air M2', 'Ultra fin et ultra puissant.', 950000],
            ['Pagne Kita Premium', 'Tissu artisanal de haute qualité.', 45000],
            ['Chaussures en Cuir', 'Fabriquées à la main par nos artisans.', 25000],
        ];

        foreach ($productData as $p) {
            Product::create([
                'shop_id' => $shops[array_rand($shops)]->id,
                'category_id' => $subCategories->random()->id,
                'name' => $p[0],
                'slug' => Str::slug($p[0]) . '-' . rand(100, 999),
                'description' => $p[1],
                'price' => $p[2],
                'stock' => rand(5, 50),
                'images' => ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80']
            ]);
        }

        // 6. Create some Test Orders for the user
        $myProducts = Product::all();
        
        // Order 1: Delivered
        $order1Total = 875000;
        $order1Commission = $order1Total * 0.10;
        $order1 = Order::create([
            'user_id' => $user->id,
            'shop_id' => $shops[0]->id,
            'order_number' => 'CMD-' . strtoupper(Str::random(8)),
            'total_amount' => $order1Total,
            'commission_amount' => $order1Commission,
            'seller_amount' => $order1Total - $order1Commission,
            'status' => 'delivered',
            'delivery_address' => 'Quartier Adidogomé, Lomé',
            'payment_method' => 'Cash'
        ]);
        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $myProducts[0]->id,
            'quantity' => 1,
            'price' => $myProducts[0]->price
        ]);
        // La commande de démo est livrée directement (sans passer par le flux normal
        // OrderController::updateStatus), donc on crédite manuellement la boutique.
        $shops[0]->increment('balance', $order1Total - $order1Commission);

        // Order 2: In progress
        $order2Total = 45000;
        $order2Commission = $order2Total * 0.10;
        $order2 = Order::create([
            'user_id' => $user->id,
            'shop_id' => $shops[1]->id,
            'driver_id' => $driver->id,
            'order_number' => 'CMD-' . strtoupper(Str::random(8)),
            'total_amount' => $order2Total,
            'commission_amount' => $order2Commission,
            'seller_amount' => $order2Total - $order2Commission,
            'status' => 'shipped',
            'delivery_address' => 'Quartier Agoè, Lomé',
            'payment_method' => 'T-Money'
        ]);
        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $myProducts[3]->id,
            'quantity' => 1,
            'price' => $myProducts[3]->price
        ]);
    }
}
