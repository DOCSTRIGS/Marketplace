<?php

$csvPath = __DIR__ . '/../public/images/products/products.csv';

if (!file_exists($csvPath)) {
    die("Fichier CSV introuvable à l'emplacement : $csvPath\n");
}

$file = fopen($csvPath, 'r');
$headers = fgetcsv($file);

// Find category index
$categoryIdx = -1;
foreach ($headers as $idx => $header) {
    if (trim(strtolower($header)) === 'category_slug') {
        $categoryIdx = $idx;
        break;
    }
}

if ($categoryIdx === -1) {
    die("Colonne 'category_slug' introuvable dans l'en-tête du CSV.\n");
}

$categories = [];
$totalProducts = 0;

while (($row = fgetcsv($file)) !== false) {
    if (empty($row) || !isset($row[$categoryIdx])) {
        continue;
    }
    $category = trim($row[$categoryIdx]);
    if (!empty($category)) {
        if (!isset($categories[$category])) {
            $categories[$category] = 0;
        }
        $categories[$category]++;
        $totalProducts++;
    }
}
fclose($file);

echo "=== ANALYSE DU FICHIER CSV (PRODUITS ACTIFS) ===\n";
echo "Nombre total de produits dans le CSV : $totalProducts\n";
echo "Catégories actives détectées :\n";
foreach ($categories as $cat => $count) {
    echo "  - Slug: '$cat' | Nombre de produits: $count\n";
}
