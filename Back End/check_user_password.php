<?php

/**
 * Script untuk cek password user di Laravel
 * Jalankan dengan: php artisan tinker < check_user_password.php
 * Atau copy-paste isi file ini ke Tinker satu per satu
 */

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Ganti email ini dengan email yang ingin dicek
$email = 'mragielprastyo@gmail.com';

echo "=== MENCARI USER ===\n";
$user = User::where('email', $email)->first();

if (!$user) {
    echo "❌ User dengan email '{$email}' tidak ditemukan!\n";
    exit;
}

echo "✅ User ditemukan!\n\n";

echo "=== INFO USER ===\n";
echo "ID: {$user->id}\n";
echo "Name: {$user->name}\n";
echo "Email: {$user->email}\n";
echo "Role: {$user->role}\n";
echo "Password Hash: " . substr($user->password, 0, 20) . "...\n";
echo "Created: {$user->created_at}\n\n";

echo "=== TESTING PASSWORDS ===\n";
echo "Masukkan password yang ingin dicek (atau tekan Enter untuk skip):\n";

// Untuk testing beberapa password umum
$testPasswords = [
    'password123',
    'admin123',
    '123456',
    'password',
    'admin',
];

foreach ($testPasswords as $pwd) {
    $match = Hash::check($pwd, $user->password);
    $status = $match ? '✅ BENAR' : '❌ SALAH';
    echo "{$status} - Password: {$pwd}\n";
}

echo "\n=== CARA RESET PASSWORD ===\n";
echo "Untuk reset password, jalankan di Tinker:\n";
echo "\$user = User::where('email', '{$email}')->first();\n";
echo "\$user->password = 'passwordbaru123';\n";
echo "\$user->save();\n";
