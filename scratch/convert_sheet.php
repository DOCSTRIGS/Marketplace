<?php

$sourcePath = 'C:\\Users\\josep\\.gemini\\antigravity\\brain\\0cbe5286-3097-40af-8876-298cdcdf5de3\\.system_generated\\steps\\153\\content.md';
$targetPath = 'd:\\xampp\\htdocs\\Marketplace\\public\\images\\products\\products.csv';

if (!file_exists($sourcePath)) {
    die("Fichier source introuvable : $sourcePath\n");
}

$lines = file($sourcePath);

// Skip metadata lines and find the header line (usually starts with "Nom du fichier")
$headerLineIndex = -1;
for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], 'Nom du fichier') !== false) {
        $headerLineIndex = $i;
        break;
    }
}

if ($headerLineIndex === -1) {
    die("Impossible de trouver la ligne d'en-tête du fichier CSV.\n");
}

// Open target file
$targetDir = dirname($targetPath);
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$outputHandle = fopen($targetPath, 'w');
if (!$outputHandle) {
    die("Impossible de créer le fichier cible : $targetPath\n");
}

// Write the standardized headers expected by the seeder
fputcsv($outputHandle, ['category_slug', 'name', 'price', 'image_name', 'description']);

// Read and process the rows
$rowCount = 0;
$skippedCount = 0;

// Read the rest of the lines starting from $headerLineIndex + 1
// We combine them into a single string to parse as CSV properly
$csvDataStr = '';
for ($j = $headerLineIndex; $j < count($lines); $j++) {
    $csvDataStr .= $lines[$j];
}

// Parse using temp memory stream
$tempStream = fopen('php://temp', 'r+');
fwrite($tempStream, $csvDataStr);
rewind($tempStream);

// Read headers from temp stream
$headers = fgetcsv($tempStream, 2000, ',');
$headerMap = array_flip(array_map('trim', $headers));

$expectedHeaders = [
    'image_name' => 'Nom du fichier',
    'name' => 'Nom du produit',
    'price' => 'Prix (FCFA)',
    'description' => 'Description',
    'category_slug' => 'Dossier'
];

$indexMap = [];
foreach ($expectedHeaders as $eng => $fr) {
    if (isset($headerMap[$fr])) {
        $indexMap[$eng] = $headerMap[$fr];
    } else {
        echo "Avertissement : en-tête manquant '$fr'\n";
    }
}

while (($row = fgetcsv($tempStream, 2000, ',')) !== FALSE) {
    // Skip empty lines or spacer lines
    if (empty($row) || count($row) < 2 || empty($row[0])) {
        continue;
    }

    $imageName = isset($indexMap['image_name']) && isset($row[$indexMap['image_name']]) ? trim($row[$indexMap['image_name']]) : '';
    $name = isset($indexMap['name']) && isset($row[$indexMap['name']]) ? trim($row[$indexMap['name']]) : '';
    $priceRaw = isset($indexMap['price']) && isset($row[$indexMap['price']]) ? trim($row[$indexMap['price']]) : '';
    $description = isset($indexMap['description']) && isset($row[$indexMap['description']]) ? trim($row[$indexMap['description']]) : '';
    $categorySlug = isset($indexMap['category_slug']) && isset($row[$indexMap['category_slug']]) ? trim($row[$indexMap['category_slug']]) : '';

    // If it's a header duplicate line, skip
    if ($imageName === 'Nom du fichier') {
        continue;
    }

    // Clean price (extract digits only)
    $price = (int) preg_replace('/\D/', '', $priceRaw);

    if (empty($imageName) || empty($name)) {
        $skippedCount++;
        continue;
    }

    fputcsv($outputHandle, [$categorySlug, $name, $price, $imageName, $description]);
    $rowCount++;
}

fclose($tempStream);
fclose($outputHandle);

echo "Conversion terminée avec succès !\n";
echo "$rowCount produits écrits dans $targetPath.\n";
echo "$skippedCount lignes ignorées.\n";
