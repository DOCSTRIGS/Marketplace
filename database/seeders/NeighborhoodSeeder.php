<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Neighborhood;
use Illuminate\Support\Str;

class NeighborhoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $neighborhoods = [
            'Adidogomé', 'Agoè', 'Bè', 'Hédzranawoé', 'Nukafu', 
            'Tokoin', 'Amoutiévé', 'Nyékonakpoè', 'Kodjoviakopé', 
            'Kégué', 'Djidjolé', 'Adakpamé', 'Baguida', 'Zanguéra'
        ];

        foreach ($neighborhoods as $name) {
            Neighborhood::firstOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}
