# Cara Menghubungkan Front End dengan Back End

## Langkah-langkah Setup

### 1. Setup Backend

Buka terminal di folder `Back End` dan jalankan:

```bash
# Install dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start Laravel server (terminal 1)
php artisan serve
```

Server backend akan berjalan di: `http://localhost:8000`

### 2. Setup Frontend

Buka terminal baru di folder `Front End` dan jalankan:

```bash
# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file dan pastikan VITE_API_URL sudah benar
# VITE_API_URL=http://localhost:8000/api

# Start Vite development server (terminal 2)
npm run dev
```

Server frontend akan berjalan di: `http://localhost:5173`

### 3. Testing Connection

1. Buka browser ke `http://localhost:5173`
2. Coba login dengan email dan password
3. Jika ada error CORS, pastikan backend berjalan di `http://localhost:8000`
4. Check browser console (F12) untuk melihat error detail

### 4. Troubleshooting

#### Error: CORS policy
- Pastikan file `Back End/config/cors.php` sudah dikonfigurasi dengan benar
- Pastikan frontend origin ada di list `allowed_origins`

#### Error: Connection refused
- Pastikan backend server (`php artisan serve`) sedang berjalan
- Check apakah port 8000 tersedia

#### Error: 401 Unauthorized
- Pastikan token tersimpan di localStorage setelah login
- Check network tab di browser dev tools untuk melihat request/response

### 5. API Endpoints

Semua API endpoint tersedia di:
- Base URL: `http://localhost:8000/api`
- Documentation: `Back End/CONNECTION_GUIDE.md`

### 6. Environment Variables

File `.env` di frontend harus berisi:
```
VITE_API_URL=http://localhost:8000/api
```

**PENTING:** File `.env` tidak di-commit ke git (ada di .gitignore). Setiap developer harus membuat `.env` sendiri dari `.env.example`.

