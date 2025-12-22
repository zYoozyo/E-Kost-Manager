# Deployment Checklist - E-Kost Manager

Dokumen ini berisi checklist lengkap untuk deployment project E-Kost Manager ke cPanel/hosting.

## ✅ Status Pemeriksaan

### Backend (Laravel)
- ✅ Semua file PHP tidak ada syntax error
- ✅ Semua Controllers terhubung dengan benar
- ✅ Semua Models terhubung dengan benar
- ✅ Routes API sudah lengkap dan benar
- ✅ Middleware sudah dikonfigurasi dengan benar
- ✅ Storage configuration sudah benar

### Frontend (React + TypeScript)
- ✅ Build berhasil tanpa error
- ✅ Semua komponen terhubung dengan benar
- ✅ Semua routes sudah dikonfigurasi
- ✅ Tidak ada linter errors
- ✅ Imports semua benar

---

## 📋 Langkah-Langkah Deployment

### 1. Persiapan Backend (Laravel)

#### A. Buat File `.env` di Back End
Copy dan buat file `.env` di folder `Back End` dengan konfigurasi berikut:

```env
APP_NAME="E-Kost Manager"
APP_ENV=production
APP_KEY=base64:... # Generate dengan: php artisan key:generate
APP_DEBUG=false
APP_URL=https://api.ekostmanager.com
APP_TIMEZONE=UTC
APP_LOCALE=id
APP_FALLBACK_LOCALE=en

FRONTEND_URL=https://ekostmanager.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=mail.ekostmanager.com
MAIL_PORT=465
MAIL_USERNAME=noreply@ekostmanager.com
MAIL_PASSWORD=your_mail_password
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

#### B. Upload Files ke Server
1. Upload semua file dari folder `Back End` ke server (kecuali):
   - `node_modules/`
   - `vendor/` (akan di-install di server)
   - `.env` (buat manual di server)
   - `storage/logs/*` (folder akan dibuat otomatis)
   - `.git/`

#### C. Install Dependencies
Via SSH, jalankan:
```bash
cd /path/to/Back\ End
composer install --no-dev --optimize-autoloader
```

#### D. Setup Laravel
```bash
# Generate application key (jika belum ada di .env)
php artisan key:generate

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Catatan**: Jika `php artisan storage:link` gagal (karena exec() disabled), gunakan file `create_storage_link.php` yang sudah tersedia.

#### E. Set Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 2. Persiapan Frontend (React)

#### A. Buat File `.env.production` di Front End
Buat file `.env.production` di folder `Front End`:

```env
VITE_API_URL=https://api.ekostmanager.com/api
```

#### B. Build Frontend
```bash
cd Front\ End
npm install
npm run build
```

File hasil build akan ada di folder `Front End/dist/`

#### C. Upload Build Files
1. Upload semua file dari folder `Front End/dist/` ke server (public_html atau folder frontend)
2. Pastikan file `index.html` ada di root folder public

### 3. Konfigurasi Server (cPanel)

#### A. Database Setup
1. Buat database MySQL di cPanel
2. Import file `Back End/ekostmanager.sql` ke database
3. Update konfigurasi database di `.env`

#### B. Domain/Subdomain Setup
1. **Backend API**: 
   - Subdomain: `api.ekostmanager.com`
   - Document Root: `/path/to/Back End/public`
   - Pastikan `.htaccess` ada di folder `public`

2. **Frontend**:
   - Domain: `ekostmanager.com` atau `www.ekostmanager.com`
   - Document Root: `/path/to/Front End/dist` (atau folder tempat file build)

#### C. PHP Configuration
- PHP Version: **8.2** atau lebih tinggi
- Enable extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `json`, `ctype`, `fileinfo`, `xml`
- `memory_limit`: minimal 256M
- `upload_max_filesize`: minimal 10M
- `post_max_size`: minimal 10M

#### D. .htaccess untuk Backend (Back End/public/.htaccess)
Pastikan file ini ada:
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

#### E. .htaccess untuk Frontend (Front End/dist/.htaccess)
Buat file ini untuk SPA routing:
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

### 4. CORS Configuration

Pastikan CORS sudah dikonfigurasi dengan benar di:
- `Back End/config/cors.php`
- `Back End/app/Http/Middleware/CorsMiddleware.php`

Domain frontend harus sudah terdaftar di allowed origins.

### 5. Storage Setup

1. Pastikan folder `storage/app/public` ada dengan permission 755
2. Pastikan symbolic link `public/storage` -> `storage/app/public` sudah dibuat
3. Buat folder jika belum ada:
   - `storage/app/public/avatars`
   - `storage/app/public/bukti-pembayaran`
   - `storage/app/public/qris-images`

### 6. Testing Setelah Deployment

#### Backend API
- [ ] Akses: `https://api.ekostmanager.com/api/up` (harus return status)
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test protected endpoints dengan token

#### Frontend
- [ ] Akses: `https://ekostmanager.com` (harus load)
- [ ] Test login
- [ ] Test register
- [ ] Test semua fitur sesuai role (admin/tenant)

### 7. Troubleshooting

#### Error: "Storage link already exists"
```bash
# Hapus link yang ada
rm public/storage
# Buat ulang
php artisan storage:link
```

#### Error: "500 Internal Server Error"
1. Cek file `.env` sudah benar
2. Cek permission folder `storage` dan `bootstrap/cache` (755)
3. Cek log: `storage/logs/laravel.log`
4. Pastikan `APP_DEBUG=false` di production

#### Error: "CORS Error"
1. Pastikan domain frontend sudah ada di `config/cors.php`
2. Pastikan `CorsMiddleware` sudah di-register di `bootstrap/app.php`
3. Clear config cache: `php artisan config:clear`

#### Error: "File upload tidak berfungsi"
1. Cek permission folder `storage/app/public` (755)
2. Cek `upload_max_filesize` dan `post_max_size` di PHP config
3. Pastikan storage link sudah dibuat

---

## 📝 Catatan Penting

1. **JANGAN** commit file `.env` ke repository
2. **PASTIKAN** `APP_DEBUG=false` di production
3. **PASTIKAN** `APP_ENV=production` di production
4. **BACKUP** database sebelum migrate
5. **TEST** semua fitur setelah deployment
6. **MONITOR** log file untuk error

---

## ✅ Checklist Final

- [ ] Backend `.env` sudah dikonfigurasi
- [ ] Database sudah dibuat dan di-import
- [ ] Dependencies backend sudah di-install
- [ ] Migration sudah dijalankan
- [ ] Storage link sudah dibuat
- [ ] Frontend sudah di-build
- [ ] File frontend sudah di-upload
- [ ] Domain/subdomain sudah dikonfigurasi
- [ ] CORS sudah dikonfigurasi
- [ ] PHP version dan extensions sudah benar
- [ ] Permissions folder sudah benar
- [ ] Testing sudah dilakukan

---

## 📞 Support

Jika ada masalah saat deployment, cek:
1. Log file: `Back End/storage/logs/laravel.log`
2. Browser console untuk error frontend
3. Network tab untuk error API

---

**Selamat Deploy! 🚀**

