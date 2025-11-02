# Cara Menghubungkan Frontend dengan Backend

Halo! Semua konfigurasi sudah siap. Sekarang tinggal jalankan kedua server.

## 🚀 Cara Menjalankan

### 1️⃣ Buka Terminal untuk Backend

```bash
cd "Back End"
composer install
php artisan migrate
php artisan serve
```

Server backend akan jalan di: **http://localhost:8000**

### 2️⃣ Buka Terminal Baru untuk Frontend

```bash
cd "Front End"
npm install

# Buat file .env
copy .env.example .env

# Jalankan server
npm run dev
```

Server frontend akan jalan di: **http://localhost:5173**

### 3️⃣ Test di Browser

Buka **http://localhost:5173** di browser dan coba login!

## ✅ Yang Sudah Dikerjakan

### Backend
- ✅ Semua controllers sudah dibuat (Auth, Kamar, Penghuni, Pembayaran, Complaint)
- ✅ Response format sudah konsisten: `{success, message, data}`
- ✅ CORS sudah dikonfigurasi
- ✅ Authentication menggunakan Laravel Sanctum
- ✅ Middleware CekRole sudah dibuat
- ✅ Model dan migration untuk Complaint sudah dibuat

### Frontend  
- ✅ API service sudah dikonfigurasi
- ✅ Authentication context sudah non-mock (MOCK_AUTH = false)
- ✅ Interceptor untuk token sudah ada
- ✅ Environment variable sudah siap (.env.example)

## 📚 Dokumentasi

- **API Endpoints**: Lihat `Back End/CONNECTION_GUIDE.md`
- **Quick Start**: Lihat `Back End/README_CONNECTION.md` atau `Front End/README_CONNECTION.md`

## ⚠️ Troubleshooting

### Error: "CORS policy"
- Pastikan backend sudah jalan di port 8000
- Pastikan frontend sudah jalan di port 5173

### Error: "Connection refused"
- Cek kedua terminal, pastikan backend dan frontend keduanya jalan

### Error: "401 Unauthorized"  
- Coba login ulang
- Check browser console (F12) untuk error detail

## 🎯 Next Steps

1. Jalankan kedua server (backend & frontend)
2. Test login/signup
3. Test dashboard untuk melihat data
4. Update dashboard pages untuk fetch real data dari API (opsional)

SELAMAT! Frontend dan Backend sudah terhubung! 🎉

