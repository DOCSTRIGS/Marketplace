<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Shop;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class ProductGallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $productsPath = public_path('images/products');

        if (!File::exists($productsPath)) {
            File::makeDirectory($productsPath, 0755, true);
            $this->command->info("Dossier public/images/products créé. Veuillez y ajouter des sous-dossiers par catégorie.");
            return;
        }

        // Fetch all available shops
        $shops = Shop::all();
        if ($shops->isEmpty()) {
            $this->command->error("Aucune boutique trouvée. Veuillez exécuter PremiumShopSeeder d'abord.");
            return;
        }

        // Smart Mapping: Category Slug -> Shop Slug
        $categoryToShopMapping = [
            // Mode et Habillement (Splitté proprement sans mélange)
            'pagnes-wax' => 'elegance-wax-pagnes',
            'vetements-homme' => 'atelier-du-pret-a-porter',
            'vetements-femme' => 'atelier-du-pret-a-porter',
            'mode-et-habillement' => 'atelier-du-pret-a-porter', // Repli général pour la Mode
            'chaussures' => 'lome-chaussures-style',
            'sacs-accessoires' => 'latelier-de-la-ceinture-cuir',
            'accessoires' => 'latelier-de-la-ceinture-cuir', // Mappage pour le dossier du CSV

            // High-Tech
            'electronique-et-high-tech' => 'dekon-high-tech-center',
            
            // Électroménager
            'electromenager' => 'electro-elite-togo',
            
            // Beauté
            'beaute-et-hygiene' => 'aura-beaute-bio',
            
            // Maison (mobilier reste chez le spécialiste meubles, le reste va à la boutique déco)
            'meubles' => 'latelier-du-meuble-royal',
            'eclairage' => 'maison-deco-lome',
            'decoration-artisanale' => 'maison-deco-lome',
            'ustensiles' => 'maison-deco-lome',
            'linge-de-maison' => 'maison-deco-lome',
            'maison-et-decoration' => 'maison-deco-lome', // Repli général pour Maison et Décoration
            
            // Sport
            'sports-et-loisirs' => 'lome-sport-vitalite',
            
            // Auto
            'automobile-et-accessoires' => 'auto-prestige-togo',
        ];

        // --- 1. CSV METADATA PARSING ---
        $csvPath = public_path('images/products/products.csv');
        $csvProducts = [];

        if (File::exists($csvPath)) {
            $this->command->info("Fichier products.csv détecté ! Lecture des métadonnées...");
            if (($handle = fopen($csvPath, "r")) !== FALSE) {
                // Read header row
                $headers = fgetcsv($handle, 1000, ",");
                
                // Support semicolon separator (common in Excel European exports)
                $delimiter = ",";
                if (count($headers) == 1 && strpos($headers[0], ';') !== false) {
                    rewind($handle);
                    $headers = fgetcsv($handle, 1000, ";");
                    $delimiter = ';';
                }

                // Map header names to column index
                // Expected columns: category_slug, name, price, image_name, description
                $headerMap = array_flip(array_map('trim', array_map('strtolower', $headers)));

                $this->command->info("Colonnes détectées : " . implode(', ', array_keys($headerMap)));

                while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
                    $item = [];
                    foreach ($headerMap as $key => $index) {
                        $item[$key] = isset($row[$index]) ? trim($row[$index]) : '';
                    }
                    if (isset($item['image_name']) && !empty($item['image_name'])) {
                        // Key by image filename (e.g. 'iphone15.jpg')
                        $csvProducts[trim($item['image_name'])] = $item;
                    }
                }
                fclose($handle);
                $this->command->info(count($csvProducts) . " produits configurés dans le fichier CSV.");
            }
        } else {
            $this->command->warn("Aucun fichier products.csv trouvé dans public/images/products/. Le script fonctionnera en mode automatique par nom de fichier.");
        }

        // Get all subdirectories in public/images/products
        $directories = File::directories($productsPath);
        
        if (empty($directories)) {
            $this->command->warn("Aucun sous-dossier de catégorie trouvé dans public/images/products.");
            $this->command->line("Exemple de structure attendue :");
            $this->command->line("  public/images/products/telephones/iphone-15_850000.jpg");
            $this->command->line("  public/images/products/refrigerateurs/lg-no-frost_450000.png");
            return;
        }

        $insertedCount = 0;

        foreach ($directories as $dir) {
            $folderName = basename($dir); // e.g. 'telephones' or 'pagnes-wax'
            
            // Find the category
            $category = Category::where('slug', $folderName)->first();
            if (!$category) {
                $category = Category::where('name', 'like', '%' . str_replace('-', ' ', $folderName) . '%')->first();
            }

            if (!$category) {
                $this->command->warn("Dossier '{$folderName}' ignoré : aucune catégorie trouvée.");
                continue;
            }

            // Find the appropriate shop for this category
            $targetShop = null;

            // 1. Check mapping using category's own slug (most specific)
            if (isset($categoryToShopMapping[$category->slug])) {
                $shopSlug = $categoryToShopMapping[$category->slug];
                $targetShop = $shops->firstWhere('slug', $shopSlug);
            }

            // 2. Check mapping using parent category slug if own slug check failed
            if (!$targetShop && $category->parent) {
                $parentSlug = $category->parent->slug;
                if (isset($categoryToShopMapping[$parentSlug])) {
                    $shopSlug = $categoryToShopMapping[$parentSlug];
                    $targetShop = $shops->firstWhere('slug', $shopSlug);
                }
            }

            // 3. Fallback to a random shop if no specific mapping found
            if (!$targetShop) {
                $targetShop = $shops->random();
            }

            // Scan files in this category folder
            $files = File::files($dir);
            $imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

            foreach ($files as $file) {
                $extension = strtolower($file->getExtension());
                if (!in_array($extension, $imageExtensions)) {
                    continue; // Skip non-image files
                }

                $filenameWithExt = $file->getFilename(); // e.g. 'iphone15.jpg'
                $filename = pathinfo($filenameWithExt, PATHINFO_FILENAME);
                
                // Initial empty fields for product
                $productName = '';
                $price = null;
                $description = '';

                // --- 2. MATCH METADATA FROM CSV ---
                if (isset($csvProducts[$filenameWithExt])) {
                    $metadata = $csvProducts[$filenameWithExt];
                    $productName = $metadata['name'] ?? '';
                    $price = isset($metadata['price']) && $metadata['price'] !== '' ? (int) $metadata['price'] : null;
                    $description = $metadata['description'] ?? '';
                    $this->command->line("Match CSV pour '{$filenameWithExt}' ➔ Nom: '{$productName}', Prix: '{$price} F'");
                }

                // If not defined in CSV, fall back to smart filename extraction
                if (empty($productName)) {
                    $cleanName = $filename;
                    if (preg_match('/_(?P<price>\d+)$/', $filename, $matches)) {
                        $price = (int) $matches['price'];
                        $cleanName = preg_replace('/_\d+$/', '', $filename);
                    }
                    $productName = ucwords(str_replace(['-', '_'], ' ', $cleanName));
                }

                if (!$price) {
                    $price = $this->getRandomPriceByCategory($category->parent ? $category->parent->name : $category->name);
                }

                if (empty($description)) {
                    $description = "Découvrez notre {$productName} de qualité supérieure. Sélectionné pour vous par la boutique '{$targetShop->name}' dans la catégorie {$category->name}. Durable, performant et d'un rapport qualité-prix exceptionnel.";
                }

                $slug = Str::slug($productName) . '-' . rand(100, 999);
                $imageRelativePath = '/images/products/' . $folderName . '/' . $filenameWithExt;

                // Check if a product with this exact image already exists
                $exists = Product::whereJsonContains('images', $imageRelativePath)->exists();

                if (!$exists) {
                    Product::create([
                        'shop_id' => $targetShop->id,
                        'category_id' => $category->id,
                        'name' => $productName,
                        'slug' => $slug,
                        'description' => $description,
                        'price' => $price,
                        'stock' => rand(8, 50),
                        'status' => 'active',
                        'variants' => $this->getSuggestedVariants($category->name),
                        'images' => [$imageRelativePath]
                    ]);
                    $insertedCount++;
                }
            }
        }

        $this->command->info("Succès ! {$insertedCount} nouveaux produits insérés avec succès.");
    }

    /**
     * Helper to get a realistic price range based on the category name
     */
    private function getRandomPriceByCategory(string $categoryName): int
    {
        return match (strtolower($categoryName)) {
            'électroménager' => rand(80000, 600000),
            'électronique et high-tech' => rand(15000, 900000),
            'mode et habillement' => rand(5000, 65000),
            'beauté et hygiène' => rand(2500, 35000),
            'maison et décoration' => rand(15000, 250000),
            'alimentation et boissons' => rand(1000, 15000),
            'santé et bien-être' => rand(5000, 45000),
            'sports et loisirs' => rand(8000, 150000),
            'automobile et accessoires' => rand(5000, 300000),
            'jeux et jouets' => rand(3000, 50000),
            default => rand(5000, 100000),
        };
    }

    /**
     * Helper to generate suggested mock variants (Size, Color, Power, etc.) depending on the category
     */
    private function getSuggestedVariants(string $categoryName): ?array
    {
        $cat = strtolower($categoryName);

        if (str_contains($cat, 'téléphones') || str_contains($cat, 'tablettes')) {
            return [
                ['name' => 'Stockage', 'value' => '128 Go / 256 Go / 512 Go'],
                ['name' => 'Couleur', 'value' => 'Noir / Titane / Or']
            ];
        }
        if (str_contains($cat, 'vêtements') || str_contains($cat, 'chaussures') || str_contains($cat, 'pagnes')) {
            return [
                ['name' => 'Taille', 'value' => 'M / L / XL / XXL'],
                ['name' => 'Couleur', 'value' => 'Motifs uniques / Bleu Indigo']
            ];
        }
        if (str_contains($cat, 'réfrigérateurs') || str_contains($cat, 'climatiseurs') || str_contains($cat, 'micro-ondes')) {
            return [
                ['name' => 'Garantie', 'value' => '12 Mois / 24 Mois'],
                ['name' => 'Capacité', 'value' => 'Standard / Format Familial']
            ];
        }
        return null;
    }
}
