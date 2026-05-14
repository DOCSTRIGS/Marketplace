<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            ['name' => 'Koffi Rapide', 'lat' => 6.1366, 'lng' => 1.2222],
            ['name' => 'Ablam Express', 'lat' => 6.1636, 'lng' => 1.2152],
            ['name' => 'Moussa Moto', 'lat' => 6.1210, 'lng' => 1.2250],
            ['name' => 'Yao Delivery', 'lat' => 6.1750, 'lng' => 1.1850],
            ['name' => 'Seli Coursier', 'lat' => 6.1450, 'lng' => 1.2050],
            ['name' => 'Komla Trans', 'lat' => 6.1950, 'lng' => 1.2350],
            ['name' => 'Efoé Moto', 'lat' => 6.1550, 'lng' => 1.1950],
            ['name' => 'Kodjo Rapido', 'lat' => 6.1310, 'lng' => 1.2450],
            ['name' => 'Amévi Livraison', 'lat' => 6.1150, 'lng' => 1.2150],
            ['name' => 'Fofo Speed', 'lat' => 6.1666, 'lng' => 1.1833],
        ];

        foreach ($locations as $i => $loc) {
            \App\Models\User::updateOrCreate(
                ['email' => "livreur" . ($i + 1) . "@lome.shop"],
                [
                    'name' => $loc['name'],
                    'password' => \Illuminate\Support\Facades\Hash::make('password'),
                    'role' => 'driver',
                    'driver_status' => 'available',
                    'last_latitude' => $loc['lat'],
                    'last_longitude' => $loc['lng'],
                    'deliveries_completed' => rand(5, 50),
                    'last_online_at' => now(),
                ]
            );
        }
    }
}
