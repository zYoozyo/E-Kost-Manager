# Solusi Error Backend

## ✅ Jawaban Singkat

**TIDAK**, Anda tidak perlu install Laravel lagi. Masalahnya ada di:
1. Composer tidak ada di PATH
2. Port 8000 sudah digunakan
3. MySQL PDO driver tidak diaktifkan

## 🎯 Solusi Tercepat

### Option 1: Gunakan Laragon (Recommended)

Karena Anda pakai Laragon:

1. **Buka Laragon** → Klik "Start All"
2. **Buka terminal Laragon**:
   - Klik kanan di folder "E-Kost Manager" di Laragon
   - Pilih "Terminal here"

3. Di terminal Laragon:
```bash
cd "Back End"
php artisan migrate
php artisan serve --port=8080
```

4. **Update Front End `.env`**:
```
VITE_API_URL=http://localhost:8080/api
```

### Option 2: Gunakan File START.bat

Saya sudah bikin file `START.bat` di folder Back End:

1. **Double click** `START.bat` di folder Back End
2. Server akan jalan di port 8080
3. Update Front End `.env`:
```
VITE_API_URL=http://localhost:8080/api
```

### Option 3: Manual Fix Composer

Jika ingin pakai composer:

1. Install Composer dari: https://getcomposer.org/download/
2. Atau gunakan Composer yang ada di Laragon:
```
D:\laragon\bin\composer\composer.bat install
```

## 📝 Yang Sudah Dikonfigurasi

✅ `.env` sudah set ke SQLite (tidak butuh MySQL)  
✅ Database file sudah ada (`database.sqlite`)  
✅ Vendor sudah terinstall  
✅ Migrations sudah siap  

## 🚀 Cara Jalankan (Copy-Paste Ini)

**Terminal 1 - Backend:**
```bash
cd "C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Back End"
php artisan migrate
php artisan serve --port=8080
```

**Terminal 2 - Frontend:**
```bash
cd "C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Front End"
npm run dev
```

Buka browser: **http://localhost:5173**

## ⚠️ Notes

- Port 8080 karena 8000 sudah dipakai
- Pakai SQLite (file database), tidak perlu setup MySQL
- Composer sebenarnya sudah ada, tapi di Laragon

## 🎉 SELESAI!

Tinggal jalankan `START.bat` atau jalankan perintah di atas!

