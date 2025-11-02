# Cara Mengatasi Error Backend

Anda **TIDAK perlu install Laravel lagi**. Masalah ada di konfigurasi PHP dan port.

## 🔴 Error yang Terjadi

1. **Composer tidak ditemukan** - "composer is not recognized"
2. **MySQL driver tidak ada** - "could not find driver"
3. **Port sudah digunakan** - "Failed to listen on 127.0.0.1:8000"

## ✅ Solusi Mudah (Menggunakan SQLite)

Karena Laragon sudah terinstall dan database file `database.sqlite` sudah ada, kita gunakan SQLite:

### Langkah 1: Konfigurasi .env untuk SQLite

```bash
cd "C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Back End"
notepad .env
```

Pastikan setting database seperti ini:

```
DB_CONNECTION=sqlite
DB_DATABASE=C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Back End\database\database.sqlite
```

**HAPUS** atau **comment out** baris MySQL:
```
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=ekosmanager
# DB_USERNAME=root
# DB_PASSWORD=
```

### Langkah 2: Gunakan Laragon untuk Menjalankan Server

Karena Anda pakai Laragon, lebih baik pakai terminal Laragon:

1. **Buka Laragon**
2. **Klik "Start All"** di Laragon
3. **Klik kanan di project** → **Terminal here**
4. Di terminal Laragon:

```bash
php artisan migrate
php artisan serve
```

Server akan jalan di port yang berbeda (cek terminal untuk URL).

### Alternatif: Gunakan Port Lain

Jika port 8000-8008 sudah digunakan, coba port lain:

```bash
php artisan serve --port=8080
```

Atau cari port yang tersedia:

```bash
php artisan serve --port=3000
```

## 🔧 Cara Alternatif: Fix MySQL PDO

Jika ingin tetap pakai MySQL:

### 1. Aktifkan PHP Extensions di Laragon

1. Buka Laragon
2. Klik "Menu" → "PHP" → "php.ini"
3. Cari baris: `;extension=pdo_mysql`
4. Ubah jadi: `extension=pdo_mysql` (hapus titik koma)
5. Cari juga: `;extension=mysqli`
6. Ubah jadi: `extension=mysqli`
7. Save file
8. Restart Laragon

### 2. Install Composer di Laragon

Laragon biasanya sudah include Composer. Cek di:
```
D:\laragon\bin\composer\composer.bat
```

Jalankan:
```bash
D:\laragon\bin\composer\composer.bat install
```

Atau tambahkan ke PATH Windows.

## 🎯 Rekomendasi: Pakai SQLite (Paling Mudah)

SQLite tidak butuh setup database server, langsung bisa jalan:

1. Edit `.env`:
```
DB_CONNECTION=sqlite
DB_DATABASE=C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Back End\database\database.sqlite
```

2. Jalankan di terminal Laragon:
```bash
php artisan migrate
php artisan serve --port=8080
```

3. Frontend akan connect ke: `http://localhost:8080/api`

4. Update `.env` di Front End:
```
VITE_API_URL=http://localhost:8080/api
```

## 🚨 Troubleshooting Port Error

Jika semua port error, cek aplikasi lain yang pakai port:

```bash
netstat -ano | findstr :8000
netstat -ano | findstr :8080
```

Kill process yang menggunakan port:
```bash
taskkill /PID <PID_NUMBER> /F
```

## 📝 Quick Fix Summary

**PALING MUDAH:**
1. Edit `.env` → set `DB_CONNECTION=sqlite`
2. Buka Laragon → Klik "Start All"
3. Terminal Laragon → `php artisan migrate`
4. Terminal Laragon → `php artisan serve --port=8080`
5. Update Front End `.env` → `VITE_API_URL=http://localhost:8080/api`

**SELESAI!** 🎉

