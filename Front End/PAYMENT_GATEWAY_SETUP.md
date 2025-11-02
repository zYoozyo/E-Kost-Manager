# Panduan Setup Payment Gateway QRIS

## 📋 Overview

Untuk membuat QR code QRIS bisa berfungsi untuk pembayaran yang sebenarnya, Anda perlu mengintegrasikan dengan payment gateway provider. Dokumen ini menjelaskan langkah-langkah setup.

## 🎯 Langkah-Langkah Setup

### 1. Pilih Payment Gateway Provider

Beberapa provider QRIS yang populer di Indonesia:

- **Midtrans** (https://midtrans.com) - Paling populer, mudah setup
- **Xendit** (https://xendit.co) - Alternatif bagus
- **Doku** (https://doku.com) - Provider Indonesia
- **Faspay** (https://faspay.co.id) - Provider lokal

### 2. Daftar Merchant Account

1. Kunjungi website provider (contoh: Midtrans)
2. Buat akun merchant
3. Lengkapi dokumen verifikasi
4. Dapatkan **Merchant ID** dan **API Key** (Server Key & Client Key)

### 3. Setup Backend API

#### Endpoint yang Diperlukan:

**POST `/api/payments/qris/create`**
- Request body:
  ```json
  {
    "invoice_id": "M1-001-124",
    "amount": 650000,
    "description": "Pembayaran sewa kost - 1 Okt-30 Okt 2025"
  }
  ```
- Response:
  ```json
  {
    "data": {
      "qris_string": "00020101021226650013ID.CO.QRIS.WWW...",
      "invoice_id": "M1-001-124",
      "amount": 650000,
      "status": "pending",
      "expires_at": "2025-10-30T23:59:59Z",
      "payment_url": "https://..."
    }
  }
  ```

**GET `/api/payments/qris/status/:invoice_id`**
- Response:
  ```json
  {
    "data": {
      "invoice_id": "M1-001-124",
      "status": "paid",
      "paid_at": "2025-10-15T10:30:00Z",
      "payment_method": "gopay"
    }
  }
  ```

### 4. Implementasi Backend (Laravel/PHP)

Contoh implementasi dengan Midtrans:

```php
// app/Http/Controllers/PaymentController.php

use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function createQRIS(Request $request)
    {
        // Setup Midtrans
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        
        $invoiceId = $request->invoice_id;
        $amount = $request->amount;
        
        // Create transaction
        $transaction = [
            'transaction_details' => [
                'order_id' => $invoiceId,
                'gross_amount' => $amount,
            ],
            'item_details' => [
                [
                    'id' => 'SEWA_KOST',
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => $request->description ?? 'Pembayaran Sewa Kost',
                ],
            ],
        ];
        
        // Generate QRIS
        $snapToken = Snap::getSnapToken($transaction);
        $snapResponse = Snap::getSnapUrl($transaction);
        
        // Get QRIS string (dari response Midtrans)
        $qrisString = $this->getQRISFromMidtrans($snapToken);
        
        // Simpan ke database
        Payment::create([
            'invoice_id' => $invoiceId,
            'amount' => $amount,
            'qris_string' => $qrisString,
            'status' => 'pending',
            'expires_at' => now()->addHours(24),
        ]);
        
        return response()->json([
            'data' => [
                'qris_string' => $qrisString,
                'invoice_id' => $invoiceId,
                'amount' => $amount,
                'status' => 'pending',
                'expires_at' => now()->addHours(24)->toISOString(),
            ]
        ]);
    }
    
    public function checkStatus($invoiceId)
    {
        $payment = Payment::where('invoice_id', $invoiceId)->first();
        
        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }
        
        // Check status dari Midtrans (via webhook atau API check)
        $status = $this->checkMidtransStatus($payment->order_id);
        
        // Update status di database
        $payment->update(['status' => $status]);
        
        return response()->json([
            'data' => [
                'invoice_id' => $invoiceId,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at?->toISOString(),
                'payment_method' => $payment->payment_method,
            ]
        ]);
    }
}
```

### 5. Setup Webhook (Opsional tapi Disarankan)

Webhook memungkinkan backend menerima notifikasi otomatis saat pembayaran berhasil:

**POST `/api/payments/webhook`**
```php
public function webhook(Request $request)
{
    // Verify signature dari Midtrans
    // Update payment status
    // Kirim notifikasi ke user
}
```

### 6. Environment Variables

Tambahkan ke `.env` backend:

```env
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_IS_PRODUCTION=false
```

### 7. Testing

#### Mode Sandbox/Development:
- Gunakan credentials sandbox dari provider
- Test dengan e-wallet sandbox atau simulator
- QRIS akan berfungsi di mode test

#### Mode Production:
- Setelah verifikasi merchant selesai
- Ganti ke production credentials
- QRIS akan bisa digunakan untuk pembayaran real

## 🔄 Flow Pembayaran QRIS

1. **User klik "Bayar"** → Frontend memanggil `POST /api/payments/qris/create`
2. **Backend generate QRIS** → Menggunakan API payment gateway
3. **QRIS string dikembalikan** → Frontend menampilkan QR code
4. **User scan QR code** → Dengan aplikasi e-wallet
5. **User melakukan pembayaran** → Di aplikasi e-wallet
6. **Polling status** → Frontend check status setiap 5 detik
7. **Payment sukses** → Backend terima webhook, update status
8. **Frontend update UI** → Menampilkan status "Lunas"

## 📝 Format QRIS String

QRIS string biasanya berbentuk:
```
00020101021226650013ID.CO.QRIS.WWW0118936000123456789020315ID.CO.QRIS.WWW0303UMI51440014ID.CO.QRIS.WWW0215123456789012345303UMI5404650.005802ID5914Nama Merchant6007Jakarta61051234562070703A016304....
```

Format ini sudah sesuai dengan standar QRIS Indonesia dan bisa langsung di-scan dengan e-wallet.

## ⚠️ Catatan Penting

1. **Jangan hardcode credentials** - Gunakan environment variables
2. **Verifikasi signature** - Saat menerima webhook, selalu verify signature
3. **Handle expiration** - QRIS biasanya expire dalam 24 jam
4. **Error handling** - Selalu handle error dengan baik
5. **Logging** - Log semua transaksi untuk audit
6. **Security** - Simpan data sensitif dengan aman

## 🚀 Quick Start dengan Midtrans

1. Install Midtrans PHP SDK:
   ```bash
   composer require midtrans/midtrans-php
   ```

2. Setup di controller seperti contoh di atas

3. Test di sandbox mode dulu

4. Setelah selesai, switch ke production

## 📞 Support

Jika ada masalah, hubungi:
- Midtrans: support@midtrans.com
- Dokumentasi: https://docs.midtrans.com

---

**Catatan**: Implementasi di frontend sudah siap, tinggal setup backend sesuai provider yang dipilih.

