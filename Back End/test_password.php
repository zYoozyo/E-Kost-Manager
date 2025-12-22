<?php

/**
 * Script untuk test password user
 * Jalankan: php artisan tinker < test_password.php
 * Atau: php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap(); require 'test_password.php';"
 */

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'mragielprastyo@gmail.com';

echo "=== MENCARI USER ===\n";
$user = User::where('email', $email)->first();

if (!$user) {
    echo "❌ User dengan email '{$email}' tidak ditemukan!\n";
    exit(1);
}

echo "✅ User ditemukan!\n\n";

echo "=== INFO USER ===\n";
echo "ID: {$user->id}\n";
echo "Name: {$user->name}\n";
echo "Email: {$user->email}\n";
echo "Role: {$user->role}\n";
echo "Password Hash: " . substr($user->password, 0, 30) . "...\n";
echo "Created: {$user->created_at}\n\n";

echo "=== TESTING PASSWORDS ===\n";
$testPasswords = [
    'password123',
    'admin123',
    '123456',
    'password',
    'admin',
    'mragiel123',
    'messi123',
    '12345678',
    'mragiel',
    'messi',
];

$found = false;
foreach ($testPasswords as $pwd) {
    $match = Hash::check($pwd, $user->password);
    $status = $match ? '✅ BENAR' : '❌ SALAH';
    echo "{$status} - Password: {$pwd}\n";
    if ($match) {
        $found = true;
    }
}

if (!$found) {
    echo "\n⚠️  Tidak ada password yang match dari daftar di atas.\n";
    echo "Password mungkin menggunakan kombinasi lain.\n";
}

echo "\n=== CARA RESET PASSWORD ===\n";
echo "Jika ingin reset password, jalankan di Tinker:\n";
echo "\$user = User::where('email', '{$email}')->first();\n";
echo "\$user->password = 'passwordbaru123';\n";
echo "\$user->save();\n";
