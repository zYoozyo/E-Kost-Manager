# Quick Start: Menghubungkan Frontend dengan Backend

## Langkah Cepat Setup

### Terminal 1: Start Backend

```bash
cd "Back End"
composer install
php artisan serve
```

Backend running di: `http://localhost:8000`

### Terminal 2: Start Frontend

```bash
cd "Front End"
npm install

# Buat file .env dari .env.example
copy .env.example .env

# Edit .env file, pastikan:
# VITE_API_URL=http://localhost:8000/api

npm run dev
```

Frontend running di: `http://localhost:5173`

### Test Koneksi

1. Buka browser: `http://localhost:5173`
2. Coba login
3. Check browser console (F12) untuk error

## File yang Telah Dibuat/Diperbarui

### Backend
- ✅ `app/Http/Controllers/Api/ComplaintController.php` - Controller baru untuk komplain
- ✅ `app/Models/Complaint.php` - Model baru
- ✅ `database/migrations/2025_10_17_000000_create_complaints_table.php` - Migration baru
- ✅ Semua controllers diperbarui dengan response structure yang konsisten
- ✅ Model Pembayaran diperbarui dengan fillable fields dan relations

### Frontend
- ✅ `.env.example` - Contoh environment configuration

### Dokumentasi
- ✅ `Back End/CONNECTION_GUIDE.md` - Panduan lengkap API endpoints
- ✅ `Front End/README_CONNECTION.md` - Quick start guide

## Response Format

Semua endpoint mengembalikan response dengan format konsisten:

### Success Response
```json
{
  "success": true,
  "message": "Pesan sukses",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Pesan error"
}
```

## Authentication

Request authenticated menggunakan Bearer Token:
```
Authorization: Bearer <token>
```

Token disimpan di `localStorage` setelah login berhasil.

## Troubleshooting

### CORS Error
- Pastikan frontend origin ada di `Back End/config/cors.php`
- Default: `http://localhost:5173` (Vite) dan `http://localhost:3000`

### 401 Unauthorized
- Check apakah token ada di localStorage
- Check apakah token dikirim di header Authorization

### Connection Refused
- Pastikan kedua server (backend & frontend) sedang berjalan
- Check port: backend (8000), frontend (5173)

## API Documentation

Lihat file `Back End/CONNECTION_GUIDE.md` untuk dokumentasi lengkap semua endpoints.

