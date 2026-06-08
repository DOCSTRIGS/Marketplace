<?php
$source_path = 'C:\Users\josep\.gemini\antigravity\brain\48446532-1f4a-49e1-90fc-5485242bc03e\lome_shop_pwa_icon_1780580993886.png';
$dest_192 = 'd:\xampp\htdocs\Marketplace\public\images\icon-192x192.png';
$dest_512 = 'd:\xampp\htdocs\Marketplace\public\images\icon-512x512.png';

if (!file_exists($source_path)) {
    die("Source file does not exist: $source_path\n");
}

if (!is_dir(dirname($dest_192))) {
    mkdir(dirname($dest_192), 0777, true);
}

function resize($source, $dest, $width, $height) {
    list($src_w, $src_h) = getimagesize($source);
    $src_img = imagecreatefrompng($source);
    if (!$src_img) {
        die("Failed to load PNG: $source\n");
    }
    
    $dst_img = imagecreatetruecolor($width, $height);
    imagealphablending($dst_img, false);
    imagesavealpha($dst_img, true);
    
    imagecopyresampled($dst_img, $src_img, 0, 0, 0, 0, $width, $height, $src_w, $src_h);
    
    if (imagepng($dst_img, $dest)) {
        echo "Resized to $width x $height saved to $dest\n";
    } else {
        echo "Failed to save resized image to $dest\n";
    }
    
    imagedestroy($src_img);
    imagedestroy($dst_img);
}

if (!extension_loaded('gd')) {
    die("GD library is not loaded. Cannot resize image. Please install/enable GD extension.\n");
}

resize($source_path, $dest_192, 192, 192);
resize($source_path, $dest_512, 512, 512);
echo "Successfully completed resizing!\n";
