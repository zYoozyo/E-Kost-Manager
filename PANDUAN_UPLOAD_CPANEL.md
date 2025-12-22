# 📤 Panduan Step-by-Step Upload ke cPanel

Panduan lengkap untuk mengupload project E-Kost Manager ke cPanel/hosting.

---

## 📋 Persiapan Sebelum Upload

### 1. Siapkan File yang Akan Di-upload

#### Backend (Laravel)
File yang perlu di-upload:
- ✅ Semua file dari folder `Back End/`
- ❌ **JANGAN upload**: `node_modules/`, `vendor/`, `.env`, `.git/`

#### Frontend (React)
File yang perlu di-build dan di-upload:
- ✅ Build hasil dari folder `Front End/dist/` (setelah `npm run build`)

---

## 🚀 LANGKAH-LANGKAH UPLOAD

### **STEP 1: Persiapkan File Frontend**

1. **Buka Terminal/Command Prompt** di folder project
2. **Masuk ke folder Front End**:
   ```bash
   cd "Front End"
   ```

3. **Buat file `.env.production`** (jika belum ada):
   ```env
   VITE_API_URL=https://api.ekostmanager.com/api
   ```
   *(Ganti dengan URL backend Anda yang sebenarnya)*

4. **Install dependencies** (jika belum):
   ```bash
   npm install
   ```

5. **Build project**:
   ```bash
   npm run build
   ```

6. **Cek hasil build**:
   - Pastikan folder `Front End/dist/` berisi file-file build
   - File penting: `index.html`, folder `assets/`

---

### **STEP 2: Buat Database di cPanel**

1. **Login ke cPanel**
2. **Buka "MySQL Databases"** (di bagian Databases)
3. **Buat Database Baru**:
   - Klik "Create New Database"
   - Nama database: `ekostmanager` (atau sesuai keinginan)
   - Klik "Create Database"

4. **Buat User Database**:
   - Scroll ke bagian "Add New User"
   - Username: `ekost_user` (atau sesuai keinginan)
   - Password: Buat password yang kuat
   - Klik "Create User"

5. **Tambahkan User ke Database**:
   - Scroll ke bagian "Add User To Database"
   - Pilih user yang baru dibuat
   - Pilih database yang baru dibuat
   - Klik "Add"
   - Centang "ALL PRIVILEGES"
   - Klik "Make Changes"

6. **Catat informasi database**:
   - Database name: `cpanelusername_ekostmanager`
   - Database user: `cpanelusername_ekost_user`
   - Database password: `password_yang_dibuat`
   - Database host: `localhost` (biasanya)

---

### **STEP 3: Import Database**

1. **Buka "phpMyAdmin"** di cPanel
2. **Pilih database** yang baru dibuat
3. **Klik tab "Import"**
4. **Pilih file**: `Back End/ekostmanager.sql`
5. **Klik "Go"** untuk mengimport
6. **Tunggu sampai selesai**

---

### **STEP 4: Upload File Backend**

#### A. Via File Manager cPanel

1. **Buka "File Manager"** di cPanel
2. **Masuk ke folder `public_html`** (atau folder yang diinginkan untuk backend)
3. **Buat folder baru** (opsional): `api` atau `backend`
4. **Upload semua file** dari folder `Back End/` ke folder tersebut
   - Gunakan "Upload" di File Manager
   - Atau gunakan "Extract" jika upload dalam bentuk ZIP

#### B. Via FTP (FileZilla, dll)

1. **Connect ke server** dengan informasi FTP dari cPanel
2. **Masuk ke folder** `public_html/api/` (atau folder backend Anda)
3. **Upload semua file** dari folder `Back End/`

**File yang perlu di-upload**:
```
Back End/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── storage/
├── artisan
├── composer.json
├── composer.lock
├── package.json
└── ... (semua file kecuali yang disebutkan di bawah)
```

**File yang TIDAK perlu di-upload**:
- `node_modules/`
- `vendor/` (akan di-install di server)
- `.env` (buat manual di server)
- `.git/`

---

### **STEP 5: Setup Backend di Server**

#### A. Buat File `.env`

1. **Via File Manager cPanel**:
   - Masuk ke folder backend yang sudah di-upload
   - Klik "New File"
   - Nama file: `.env`
   - Klik "Edit" dan isi dengan konfigurasi berikut:

```env
APP_NAME="E-Kost Manager"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.ekostmanager.com
APP_TIMEZONE=UTC
APP_LOCALE=id

FRONTEND_URL=https://ekostmanager.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration (GANTI dengan data database Anda)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cpanelusername_ekostmanager
DB_USERNAME=cpanelusername_ekost_user
DB_PASSWORD=password_database_anda

# Mail Configuration (GANTI dengan data email Anda)
MAIL_MAILER=smtp
MAIL_HOST=mail.ekostmanager.com
MAIL_PORT=465
MAIL_USERNAME=noreply@ekostmanager.com
MAIL_PASSWORD=password_email_anda
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="noreply@ekostmanager.com"
MAIL_FROM_NAME="${APP_NAME}"

# Session Configuration
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Cache Configuration
CACHE_STORE=database

# Queue Configuration
QUEUE_CONNECTION=database

# Filesystem Configuration
FILESYSTEM_DISK=local

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=ekostmanager.com,www.ekostmanager.com
```

2. **Generate APP_KEY**:
   - Buka "Terminal" di cPanel (jika tersedia)
   - Atau via SSH
   - Masuk ke folder backend:
     ```bash
     cd public_html/api
     ```
   - Jalankan:
     ```bash
     php artisan key:generate
     ```
   - Copy `APP_KEY` yang di-generate ke file `.env`

#### B. Install Dependencies via SSH/Terminal

1. **Masuk ke folder backend**:
   ```bash
   cd public_html/api
   ```

2. **Install Composer dependencies**:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

3. **Jalankan migrations** (jika belum import SQL):
   ```bash
   php artisan migrate --force
   ```

4. **Create storage link**:
   ```bash
   php artisan storage:link
   ```
   
   **Jika gagal**, gunakan file `create_storage_link.php`:
   - Akses via browser: `https://api.ekostmanager.com/create_storage_link.php`
   - Atau jalankan via SSH: `php create_storage_link.php`

5. **Optimize Laravel**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

#### C. Set Permissions (via File Manager)

1. **Klik kanan** folder `storage` → **Change Permissions**
2. **Set ke `755`** (atau `775`)
3. **Klik kanan** folder `bootstrap/cache` → **Change Permissions**
4. **Set ke `755`** (atau `775`)

#### D. Buat Folder Storage (jika belum ada)

Pastikan folder berikut ada dengan permission 755:
- `storage/app/public/avatars`
- `storage/app/public/bukti-pembayaran`
- `storage/app/public/qris-images`

---

### **STEP 6: Konfigurasi Domain/Subdomain**

#### A. Setup Subdomain untuk Backend API

1. **Buka "Subdomains"** di cPanel
2. **Buat subdomain baru**:
   - Subdomain: `api`
   - Domain: `ekostmanager.com`
   - Document Root: `/public_html/api/public` (atau folder backend/public Anda)
   - Klik "Create"

#### B. Setup Domain untuk Frontend

1. **Buka "Addon Domains"** atau gunakan domain utama
2. **Document Root**: `/public_html` (atau folder khusus frontend)

---

### **STEP 7: Upload File Frontend**

1. **Masuk ke folder frontend** di File Manager (misal: `public_html/`)
2. **Hapus semua file lama** (jika ada) di folder tersebut
3. **Upload semua file** dari folder `Front End/dist/` ke folder tersebut

**File yang perlu di-upload**:
```
Front End/dist/
├── index.html
├── assets/
│   ├── index-xxxxx.css
│   └── index-xxxxx.js
└── ... (semua file di folder dist)
```

4. **Buat file `.htaccess`** di folder frontend (jika belum ada):

**Klik "New File"** → nama: `.htaccess` → isi dengan:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

### **STEP 8: Konfigurasi PHP**

1. **Buka "Select PHP Version"** di cPanel
2. **Pilih PHP 8.2** atau lebih tinggi
3. **Klik "Extensions"** dan pastikan extension berikut aktif:
   - ✅ `pdo_mysql`
   - ✅ `mbstring`
   - ✅ `openssl`
   - ✅ `tokenizer`
   - ✅ `json`
   - ✅ `ctype`
   - ✅ `fileinfo`
   - ✅ `xml`

4. **Klik "Options"** dan pastikan:
   - `memory_limit`: minimal `256M`
   - `upload_max_filesize`: minimal `10M`
   - `post_max_size`: minimal `10M`

---

### **STEP 9: Verifikasi .htaccess Backend**

Pastikan file `.htaccess` ada di `Back End/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

### **STEP 10: Testing**

#### Test Backend API:

1. **Akses**: `https://api.ekostmanager.com/api/up`
   - Harus return status/response

2. **Test Register**:
   - POST ke: `https://api.ekostmanager.com/api/auth/register`

3. **Test Login**:
   - POST ke: `https://api.ekostmanager.com/api/auth/login`

#### Test Frontend:

1. **Akses**: `https://ekostmanager.com`
   - Harus load halaman login

2. **Test Login**:
   - Coba login dengan akun yang sudah dibuat

3. **Test Register**:
   - Coba register akun baru

4. **Test semua fitur** sesuai role (admin/tenant)

---

## ⚠️ Troubleshooting

### Error: "500 Internal Server Error"

**Solusi:**
1. Cek file `.env` sudah benar
2. Cek permission folder `storage` dan `bootstrap/cache` (755)
3. Cek log: `storage/logs/laravel.log` (via File Manager)
4. Pastikan `APP_DEBUG=false` di production (tapi bisa set `true` sementara untuk debugging)

### Error: "Storage link already exists"

**Solusi:**
1. Via SSH:
   ```bash
   rm public/storage
   php artisan storage:link
   ```

2. Atau via browser: `https://api.ekostmanager.com/create_storage_link.php`

### Error: "CORS Error"

**Solusi:**
1. Pastikan domain frontend sudah ada di `Back End/config/cors.php`
2. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

### Error: "File upload tidak berfungsi"

**Solusi:**
1. Cek permission folder `storage/app/public` (755)
2. Cek `upload_max_filesize` dan `post_max_size` di PHP config
3. Pastikan storage link sudah dibuat

### Error: "Database connection failed"

**Solusi:**
1. Cek credentials database di `.env`
2. Pastikan format database name: `cpanelusername_databasename`
3. Pastikan user sudah ditambahkan ke database di cPanel
4. Cek host (biasanya `localhost`)

---

## ✅ Checklist Final

Sebelum menutup, pastikan:

- [ ] Database sudah dibuat dan di-import
- [ ] File backend sudah di-upload
- [ ] File `.env` sudah dibuat dan dikonfigurasi
- [ ] `APP_KEY` sudah di-generate
- [ ] Composer dependencies sudah di-install
- [ ] Storage link sudah dibuat
- [ ] Permissions folder sudah benar (755)
- [ ] File frontend (build) sudah di-upload
- [ ] File `.htaccess` sudah ada di frontend
- [ ] Subdomain backend sudah dikonfigurasi
- [ ] PHP version dan extensions sudah benar
- [ ] Testing sudah dilakukan

---

## 📞 Catatan Penting

1. **JANGAN** set `APP_DEBUG=true` di production
2. **JANGAN** commit file `.env` ke repository
3. **BACKUP** database sebelum melakukan perubahan
4. **TEST** semua fitur setelah deployment
5. **MONITOR** log file untuk error

---

**Selamat! Project Anda sudah berhasil di-deploy! 🎉**

