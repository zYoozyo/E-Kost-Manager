# Panduan Menghubungkan Frontend dengan Backend

## Persyaratan

1. PHP 8.1 atau lebih tinggi
2. Composer terinstall
3. Node.js dan npm terinstall
4. Laravel Sanctum sudah terinstall

## Setup Backend

1. Install dependencies:
```bash
cd "Back End"
composer install
```

2. Setup environment:
```bash
copy .env.example .env
php artisan key:generate
```

3. Setup database:
```bash
php artisan migrate
```

4. Jalankan server:
```bash
php artisan serve
```
Server akan berjalan di `http://localhost:8000`

## Setup Frontend

1. Install dependencies:
```bash
cd "Front End"
npm install
```

2. Setup environment:
```bash
copy .env.example .env
```
Pastikan `VITE_API_URL=http://localhost:8000/api` sudah benar.

3. Jalankan development server:
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/signup` - Register user baru
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/profile` - Get user profile (requires auth)

### Dashboard (requires auth)
- `GET /api/dashboard` - Get dashboard data berdasarkan role

### Kamar (requires auth: pemilik)
- `GET /api/kosts` - List semua kamar
- `POST /api/kosts` - Tambah kamar
- `GET /api/kosts/{id}` - Detail kamar
- `PUT /api/kosts/{id}` - Update kamar
- `DELETE /api/kosts/{id}` - Hapus kamar
- `GET /api/my-kost` - Kamar user yang login

### Tenant (requires auth: pemilik)
- `GET /api/tenants` - List penghuni
- `POST /api/tenants` - Tambah penghuni
- `GET /api/tenants/{id}` - Detail penghuni
- `PUT /api/tenants/{id}` - Update penghuni
- `DELETE /api/tenants/{id}` - Hapus penghuni

### Payment (requires auth)
- `GET /api/payments` - List pembayaran (filtered by role)
- `POST /api/payments` - Tambah pembayaran
- `GET /api/payments/{id}` - Detail pembayaran
- `PUT /api/payments/{id}` - Update pembayaran (admin only)
- `DELETE /api/payments/{id}` - Hapus pembayaran (admin only)
- `GET /api/my-payments` - Pembayaran user yang login

### Complaint (requires auth)
- `GET /api/complaints` - List komplain (filtered by role)
- `POST /api/complaints` - Tambah komplain
- `GET /api/complaints/{id}` - Detail komplain
- `PUT /api/complaints/{id}` - Update komplain
- `DELETE /api/complaints/{id}` - Hapus komplain
- `GET /api/my-complaints` - Komplain user yang login

## Response Format

Semua endpoint mengembalikan response dalam format:

```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": { ... }
}
```

Untuk error:
```json
{
  "success": false,
  "message": "Pesan error"
}
```

## Authentication

Semua request authenticated menggunakan Bearer Token:
```
Authorization: Bearer <token>
```

Token dikirim dari frontend setelah login berhasil.

## CORS

CORS sudah dikonfigurasi untuk origin berikut:
- `http://localhost:3000`
- `http://localhost:5173`

Untuk development pada port lain, edit file `Back End/config/cors.php`.

