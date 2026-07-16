<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CompressProductImages extends Command
{
    protected $signature = 'images:compress-products
        {--dry-run : List what would change without touching files or the database}
        {--delete-originals : Delete the original raw files once the .webp replacement is confirmed on disk}';

    protected $description = 'Resize + convert public/images/products/** to WebP (matching the ProductController upload pipeline) and update products.images in the database to point at the new files.';

    private const MAX_DIM = 800;
    private const QUALITY = 75;

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $deleteOriginals = (bool) $this->option('delete-originals');

        $root = public_path('images/products');
        $files = collect(\Illuminate\Support\Facades\File::allFiles($root))
            ->filter(fn($f) => in_array(strtolower($f->getExtension()), ['jpg', 'jpeg', 'png']));

        $this->info("Found {$files->count()} raw image files under public/images/products.");

        $pathMap = []; // '/images/products/x/y.jpg' => '/images/products/x/y.webp'
        $totalBefore = 0;
        $totalAfter = 0;

        foreach ($files as $file) {
            $sourcePath = $file->getPathname();
            $relativeDir = str_replace('\\', '/', dirname($file->getPathname()));
            $relativeDir = substr($relativeDir, strlen(str_replace('\\', '/', $root)));
            $webpFilename = pathinfo($file->getFilename(), PATHINFO_FILENAME) . '.webp';
            $webpPath = $root . $relativeDir . '/' . $webpFilename;

            $oldPublicPath = '/images/products' . $relativeDir . '/' . $file->getFilename();
            $newPublicPath = '/images/products' . $relativeDir . '/' . $webpFilename;

            $beforeSize = filesize($sourcePath);
            $totalBefore += $beforeSize;

            if (file_exists($webpPath)) {
                $totalAfter += filesize($webpPath);
                $pathMap[$oldPublicPath] = $newPublicPath;
                continue;
            }

            if ($dryRun) {
                $this->line("  [dry-run] would compress: {$oldPublicPath}");
                $pathMap[$oldPublicPath] = $newPublicPath;
                continue;
            }

            $mime = mime_content_type($sourcePath);
            $image = match ($mime) {
                'image/jpeg' => imagecreatefromjpeg($sourcePath),
                'image/png' => imagecreatefrompng($sourcePath),
                default => null,
            };

            if (!$image) {
                $this->warn("  Skipped (unreadable): {$oldPublicPath}");
                continue;
            }

            if ($mime === 'image/png') {
                imagepalettetotruecolor($image);
                imagealphablending($image, true);
                imagesavealpha($image, true);
            }

            $width = imagesx($image);
            $height = imagesy($image);

            if ($width > self::MAX_DIM || $height > self::MAX_DIM) {
                $ratio = $width / $height;
                if ($ratio > 1) {
                    $newWidth = self::MAX_DIM;
                    $newHeight = (int) round(self::MAX_DIM / $ratio);
                } else {
                    $newHeight = self::MAX_DIM;
                    $newWidth = (int) round(self::MAX_DIM * $ratio);
                }

                $resized = imagecreatetruecolor($newWidth, $newHeight);
                if ($mime === 'image/png') {
                    imagealphablending($resized, false);
                    imagesavealpha($resized, true);
                    $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
                    imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
                }
                imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($image);
                $image = $resized;
            }

            imagewebp($image, $webpPath, self::QUALITY);
            imagedestroy($image);

            $afterSize = filesize($webpPath);
            $totalBefore += 0; // already counted above
            $totalAfter += $afterSize;

            $pathMap[$oldPublicPath] = $newPublicPath;

            $this->line(sprintf(
                '  %s -> %s (%.1f KB -> %.1f KB)',
                $oldPublicPath,
                $newPublicPath,
                $beforeSize / 1024,
                $afterSize / 1024
            ));

            if ($deleteOriginals) {
                @unlink($sourcePath);
            }
        }

        $this->info(sprintf(
            'Total: %.1f MB -> %.1f MB (%d files mapped)',
            $totalBefore / 1024 / 1024,
            $totalAfter / 1024 / 1024,
            count($pathMap)
        ));

        // Update database references (products.images JSON column)
        $updated = 0;
        \App\Models\Product::whereNotNull('images')->chunkById(50, function ($products) use (&$updated, $pathMap, $dryRun) {
            foreach ($products as $product) {
                $images = $product->images ?? [];
                $changed = false;
                $newImages = array_map(function ($path) use ($pathMap, &$changed) {
                    if (isset($pathMap[$path])) {
                        $changed = true;
                        return $pathMap[$path];
                    }
                    return $path;
                }, $images);

                if ($changed) {
                    $updated++;
                    if (!$dryRun) {
                        $product->images = $newImages;
                        $product->save();
                    }
                }
            }
        });

        $this->info(($dryRun ? '[dry-run] Would update' : 'Updated') . " {$updated} product(s) in the database.");

        // Some seeded shops reuse a product photo as their logo/cover image.
        $shopsUpdated = 0;
        \App\Models\Shop::where(function ($q) {
            $q->whereNotNull('logo')->orWhereNotNull('cover_image');
        })->chunkById(50, function ($shops) use (&$shopsUpdated, $pathMap, $dryRun) {
            foreach ($shops as $shop) {
                $changed = false;
                if ($shop->logo && isset($pathMap[$shop->logo])) {
                    $shop->logo = $pathMap[$shop->logo];
                    $changed = true;
                }
                if ($shop->cover_image && isset($pathMap[$shop->cover_image])) {
                    $shop->cover_image = $pathMap[$shop->cover_image];
                    $changed = true;
                }
                if ($changed) {
                    $shopsUpdated++;
                    if (!$dryRun) {
                        $shop->save();
                    }
                }
            }
        });

        $this->info(($dryRun ? '[dry-run] Would update' : 'Updated') . " {$shopsUpdated} shop(s) in the database.");

        file_put_contents(
            storage_path('app/private/image-compression-map.json'),
            json_encode($pathMap, JSON_PRETTY_PRINT)
        );

        return self::SUCCESS;
    }
}
