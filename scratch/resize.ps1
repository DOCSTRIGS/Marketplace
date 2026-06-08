Add-Type -AssemblyName System.Drawing

$sourcePath = 'C:\Users\josep\.gemini\antigravity\brain\48446532-1f4a-49e1-90fc-5485242bc03e\lome_shop_pwa_icon_1780580993886.png'
$dest192 = 'd:\xampp\htdocs\Marketplace\public\images\icon-192x192.png'
$dest512 = 'd:\xampp\htdocs\Marketplace\public\images\icon-512x512.png'

function Resize-Image {
    param(
        [string]$src,
        [string]$dst,
        [int]$w,
        [int]$h
    )
    $srcImg = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($srcImg, 0, 0, $w, $h)
    $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
}

Resize-Image -src $sourcePath -dst $dest192 -w 192 -h 192
Resize-Image -src $sourcePath -dst $dest512 -w 512 -h 512

Write-Output "Successfully resized images!"
