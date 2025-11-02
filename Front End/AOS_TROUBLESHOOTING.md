# Troubleshooting AOS Animations

## ✅ Yang Sudah Diperbaiki

1. **CSS AOS diimport** di `src/utils/index.css`
2. **AOS initialization** dengan delay dan refresh
3. **Event listener** untuk resize

## 🔍 Jika Animasi Masih Tidak Muncul

### 1. Cek Browser Console
Buka Developer Tools (F12) dan cek apakah ada error:
```
Error initializing AOS: ...
```

### 2. Verifikasi AOS CSS Loaded
Buka Network tab di Developer Tools, pastikan file AOS CSS ter-load:
- URL: `https://unpkg.com/aos@2.3.4/dist/aos.css`

### 3. Cek Package Installation
Pastikan AOS terinstall:
```bash
cd "Front End"
npm list aos
```

Jika belum terinstall:
```bash
npm install aos@2.3.4
```

### 4. Test Manual di Console
Buka browser console dan ketik:
```javascript
import('aos').then(AOS => {
  AOS.refresh();
  console.log('AOS refreshed');
});
```

### 5. Cek Data Attributes
Pastikan elemen memiliki `data-aos` attribute:
```html
<div data-aos="fade-up">Content</div>
```

### 6. Hard Refresh Browser
- Windows/Linux: `Ctrl + Shift + R` atau `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 7. Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

## 🎯 Alternatif: Import AOS Secara Langsung

Jika dynamic import tidak bekerja, coba import langsung:

```typescript
import AOS from 'aos';
import 'aos/dist/aos.css';

useEffect(() => {
  AOS.init({
    duration: 1000,
    easing: 'ease-out-cubic',
    once: false,
    offset: 50,
  });
  
  setTimeout(() => {
    AOS.refresh();
  }, 300);
}, []);
```

## 📝 Status Saat Ini

- ✅ AOS CSS: Imported via CDN di `index.css`
- ✅ AOS Library: Terinstall di package.json
- ✅ Initialization: Ada di LoginPage.tsx
- ✅ Data attributes: Sudah ditambahkan di semua elemen

## 🐛 Common Issues

### Issue: Animasi tidak muncul sama sekali
**Solution**: Pastikan AOS CSS sudah di-load dan tidak ada error di console

### Issue: Animasi muncul tapi terlalu cepat
**Solution**: Increase `duration` di AOS.init() atau tambahkan `data-aos-duration`

### Issue: Animasi hanya sekali, tidak repeat
**Solution**: Set `once: false` di AOS.init()

### Issue: Animasi muncul saat scroll up
**Solution**: Set `once: true` jika ingin animasi hanya sekali

## 📞 Need Help?

Jika masih tidak bekerja:
1. Check browser console untuk errors
2. Pastikan semua dependencies terinstall
3. Hard refresh browser
4. Restart dev server

