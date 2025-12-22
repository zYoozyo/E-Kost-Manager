<?php
/**
 * Script untuk membuat storage link secara manual
 * Gunakan script ini jika `php artisan storage:link` gagal karena exec() disabled
 * 
 * Cara penggunaan:
 * 1. Upload file ini ke root folder Back End (sama level dengan artisan)
 * 2. Jalankan via browser: https://api.ekostmanager.com/create_storage_link.php
 *    ATAU via SSH: php create_storage_link.php
 * 3. Hapus file ini setelah selesai (untuk keamanan)
 */

// Path ke folder public (relative dari file ini)
$publicPath = __DIR__ . '/public/storage';
$storagePath = __DIR__ . '/storage/app/public';

// Hapus link yang sudah ada jika ada
if (is_link($publicPath)) {
    unlink($publicPath);
    echo "Link lama dihapus.\n";
}

// Hapus folder jika ada (bukan link)
if (is_dir($publicPath) && !is_link($publicPath)) {
    rmdir($publicPath);
    echo "Folder lama dihapus.\n";
}

// Buat symbolic link
if (!file_exists($storagePath)) {
    // Buat folder storage/app/public jika belum ada
    if (!is_dir($storagePath)) {
        mkdir($storagePath, 0755, true);
        echo "Folder storage/app/public dibuat.\n";
    }
}

// Buat symbolic link
if (symlink($storagePath, $publicPath)) {
    echo "✅ Storage link berhasil dibuat!\n";
    echo "Link: $publicPath -> $storagePath\n";
} else {
    echo "❌ Gagal membuat storage link.\n";
    echo "Pastikan:\n";
    echo "1. Permission folder public/ adalah 755 atau 775\n";
    echo "2. Permission folder storage/ adalah 775\n";
    echo "3. Server mendukung symbolic links\n";
    exit(1);
}

// Verifikasi
if (is_link($publicPath) && readlink($publicPath) === $storagePath) {
    echo "\n✅ Verifikasi berhasil! Storage link sudah aktif.\n";
} else {
    echo "\n⚠️  Warning: Link dibuat tapi verifikasi gagal.\n";
}


