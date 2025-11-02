# Cara Menjalankan Backend

## 🚨 Error yang Paling Sering: "Cannot open file artisan"

**PENYEBAB:** Terminal terbuka di folder yang salah!

### Solusi 1: Double-click File (Paling Mudah)

1. Buka File Explorer
2. Navigate ke folder `Back End`
3. **Double-click** file `RUN_SERVER.bat`
4. Server akan jalan di `http://localhost:8080`

### Solusi 2: Command Prompt Manual

Buka Command Prompt dan copy-paste ini:

```cmd
cd "C:\Users\USER\OneDrive\Desktop\E-Kost Manager\Back End"
php artisan serve --port=8080
```

### Solusi 3: Pakai Laragon Terminal

1. Buka Laragon
2. Di sisi kiri, cari folder **E-Kost Manager**
3. **Klik kanan** pada folder tersebut
4. Pilih **"Open in Terminal"**
5. Ketik:
```bash
cd "Back End"
php artisan serve --port=8080
```

## 📝 Penting!

- **JANGAN** buka terminal di `D:\laragon\www`
- **JANGAN** buka terminal di folder root project
- **HARUS** buka terminal di folder `Back End`

## ✅ Setelah Backend Jalan

Update file `Front End\.env`:

```
VITE_API_URL=http://localhost:8080/api
```

Kemudian jalankan frontend:

```bash
cd "Front End"
npm run dev
```

Buka browser: `http://localhost:5173`

## 🎉 Selesai!

Frontend dan Backend sudah terhubung!


