# Panduan Menambahkan Logo dan Gambar Kost

## 1. Menambahkan Logo Anda

### Lokasi File Logo
Letakkan file logo Anda di folder `Front End/public/img/` dengan nama `logo.png` atau `logo.svg`.

**PENTING**: File harus ada di folder `public/img/` bukan di `src/img/` karena Vite hanya bisa mengakses file static dari folder `public/`.

### Cara Mengganti Logo
Buka file `Front End/src/pages/LoginPage.tsx` dan cari bagian navbar (sekitar baris 28):

```tsx
<img src="/img/logo.png" alt="Logo" className="h-8 w-8 rounded-md" />
```

Jika Anda ingin menggunakan nama file yang berbeda, ganti `logo.png` dengan nama file Anda:
```tsx
<img src="/img/nama-logo-anda.png" alt="Logo" className="h-8 w-8 rounded-md" />
```

### Ukuran Logo yang Direkomendasikan
- Format: PNG atau SVG
- Ukuran: 32x32 pixels atau lebih besar (akan di-resize otomatis)
- Background: Transparan atau sesuai dengan tema

## 2. Menambahkan Gambar Kost

### Lokasi File Gambar Kost
Letakkan file gambar kost Anda di folder `Front End/public/img/` dengan nama `kost-image.jpg` atau `kost-image.png`.

**PENTING**: File harus ada di folder `public/img/` bukan di `src/img/` karena Vite hanya bisa mengakses file static dari folder `public/`.

### Cara Mengganti Gambar Kost
Buka file `Front End/src/pages/LoginPage.tsx` dan cari bagian hero section (sekitar baris 97-105):

```tsx
<div className="rounded-xl bg-white/5 border border-white/10 aspect-video flex items-center justify-center" data-aos="fade-left">
  {/* Image Placeholder - Replace with your kost image */}
  <div className="text-center text-white/40">
    {/* TODO: Replace this div with your kost image */}
    {/* <img src="/path/to/your/kost-image.jpg" alt="Kost Image" className="w-full h-full object-cover rounded-xl" /> */}
    <div className="text-sm">Gambar Kost</div>
    <div className="text-xs mt-1">Akan ditampilkan di sini</div>
  </div>
</div>
```

Ganti dengan:
```tsx
<div className="rounded-xl bg-white/5 border border-white/10 aspect-video overflow-hidden" data-aos="fade-left">
  <img src="/img/kost-image.jpg" alt="Kost Image" className="w-full h-full object-cover" />
</div>
```

### Ukuran Gambar Kost yang Direkomendasikan
- Format: JPG atau PNG
- Rasio: 16:9 (landscape)
- Resolusi: Minimal 800x450 pixels
- Ukuran file: Maksimal 2MB untuk performa optimal

## 3. Fitur yang Sudah Diimplementasikan

### ✅ Navbar Fixed/Sticky
- Navbar sekarang tetap di atas saat scroll
- Menggunakan `fixed top-0 left-0 right-0 z-50`
- Background dengan blur effect untuk transparansi

### ✅ Responsive Design
- **Mobile**: Layout 1 kolom, tombol stack vertikal
- **Tablet**: Layout 2 kolom untuk features
- **Desktop**: Layout 3 kolom untuk features
- Mobile menu dengan hamburger button

### ✅ Mobile Menu
- Menu hamburger untuk layar kecil
- Dropdown menu yang smooth
- Tombol login/signup tetap accessible

### ✅ Placeholder untuk Logo dan Gambar
- Tempat yang jelas untuk logo di navbar
- Tempat yang jelas untuk gambar kost di hero section
- Komentar TODO untuk memudahkan penggantian

## 4. Cara Menjalankan Project

1. Buka terminal di folder `Front End`
2. Jalankan perintah:
   ```bash
   npm install
   npm run dev
   ```
3. Buka browser dan akses `http://localhost:5173`

## 5. Tips Tambahan

- Pastikan file logo dan gambar memiliki nama yang sesuai
- Gunakan format yang optimal (SVG untuk logo, JPG untuk foto)
- Test tampilan di berbagai ukuran layar
- Pastikan gambar tidak terlalu besar untuk performa yang baik
