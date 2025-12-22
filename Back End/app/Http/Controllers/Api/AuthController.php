<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kost;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;

class AuthController extends Controller
{
    // ===========================
    // REGISTER
    // ===========================
    public function register(Request $request)
    {
        try {
            Log::info('📥 Registration request:', $request->all());

            // VALIDATE OTP FIRST - user harus sudah verify OTP
            if ($request->has('otp')) {
                $otpValid = OtpService::verifyOtpForEmail($request->email, $request->otp);
                if (! $otpValid['ok']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'OTP tidak valid atau sudah kadaluarsa',
                    ], 422);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP wajib diisi',
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
                'password_confirmation' => 'required|same:password',
                'role' => 'required|string|in:admin,tenant',
                'whatsapp' => 'nullable|string|max:20',
                'otp' => 'required|string|size:6',
                // admin specific fields
                'namaKost' => 'required_if:role,admin|string|max:255',
                'alamat' => 'required_if:role,admin|string',
                'kodePos' => 'required_if:role,admin|string|max:10',
                'provinsi' => 'required_if:role,admin|string|max:100',
                'kota' => 'required_if:role,admin|string|max:100',
                'kecamatan' => 'required_if:role,admin|string|max:100',
                'kelurahan' => 'required_if:role,admin|string|max:100',
                // pilihanPembayaran kini diatur setelah registrasi melalui pengaturan pemilik
                'pilihanPembayaran' => 'sometimes|nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $validated = $validator->validated();

            // Create user
            // Password akan otomatis di-hash oleh model User (cast 'hashed')
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'], // Biarkan model yang hash (cast 'hashed')
                'role' => $validated['role'],
                'phone' => $validated['whatsapp'] ?? null,
                'whatsapp' => $validated['whatsapp'] ?? null,
                // Simpan alamat utama ke kolom address di users agar langsung muncul di profil
                'address' => $validated['alamat'] ?? null,
            ]);

            // Create admin profile + default kost record if role is admin
            if ($validated['role'] === 'admin') {
                $user->ownerProfile()->create([
                    'nama_kost' => $validated['namaKost'],
                    'alamat' => $validated['alamat'],
                    'kode_pos' => $validated['kodePos'],
                    'provinsi' => $validated['provinsi'],
                    'kota' => $validated['kota'],
                    'kecamatan' => $validated['kecamatan'],
                    'kelurahan' => $validated['kelurahan'],
                    'pilihan_pembayaran' => $validated['pilihanPembayaran'] ?? null,
                ]);

                // Buat satu record kost agar relasi kost <-> kamar <-> owner bisa digunakan
                Kost::create([
                    'user_id' => $user->id,
                    'nama_kost' => $validated['namaKost'],
                    'alamat_kost' => $validated['alamat'],
                    'jumlah_kamar' => 0,
                    'harga' => 0,
                ]);
            }

            // Load relationship
            $user->load('ownerProfile');

            Log::info('✅ User registered:', ['id' => $user->id, 'role' => $user->role]);

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil',
                'user' => $user,
            ], 201);
        } catch (\Exception $e) {
            Log::error('💥 Registration error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: '.$e->getMessage(),
            ], 500);
        }
    }

    // ===========================
    // LOGIN
    // ===========================
    public function login(Request $request)
    {
        try {
            Log::info('📥 Login request:', [
                'email' => $request->email,
                'has_password' => $request->has('password'),
            ]);

            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            // Cari user berdasarkan email saja; role ditentukan oleh data user di database
            $user = User::where('email', $request->email)->first();

            if (! $user) {
                Log::warning('❌ Login failed: User not found', ['email' => $request->email]);
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah!',
                ], 401);
            }

            // Cek password
            $passwordMatch = Hash::check($request->password, $user->password);
            
            Log::info('🔐 Password check:', [
                'email' => $request->email,
                'user_id' => $user->id,
                'password_match' => $passwordMatch,
            ]);

            if (! $passwordMatch) {
                Log::warning('❌ Login failed: Password mismatch', [
                    'email' => $request->email,
                    'user_id' => $user->id,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah!',
                ], 401);
            }

            // buat token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Jangan ubah $user->avatar (biarkan sebagai path relatif di database)
            // avatar_url akan otomatis di-generate oleh getAvatarUrlAttribute() di model User
            // Tidak perlu set manual karena sudah ada di $appends

            Log::info('✅ Login successful:', [
                'user_id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            Log::error('💥 Login error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat login: '.$e->getMessage(),
            ], 500);
        }
    }

    // ===========================
    // PROFILE
    // ===========================
    public function profile(Request $request)
    {
        $user = $request->user();

        // Load relations needed on the frontend (owner profile & kosts)
        $user->loadMissing('ownerProfile', 'kosts');

        // Jangan ubah $user->avatar (biarkan sebagai path relatif di database)
        // avatar_url akan otomatis di-generate oleh getAvatarUrlAttribute() di model User
        // Tidak perlu set manual karena sudah ada di $appends

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diambil',
            'data' => $user,
        ]);
    }

    // UPDATE PROFILE
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Validasi untuk field non-file terlebih dahulu
        $rules = [
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|nullable|string|max:255|unique:users,username,'.$user->id,
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'whatsapp' => 'sometimes|nullable|string|max:255',
            'address' => 'sometimes|nullable|string',
            'password' => 'sometimes|string|min:6|confirmed',
        ];

        // Validasi avatar hanya jika ada file yang diupload
        if ($request->hasFile('avatar')) {
            $rules['avatar'] = 'required|image|mimes:jpeg,png,jpg,gif|max:2048'; // 2MB max
        } else {
            // Jika tidak ada file, avatar adalah optional
            $rules['avatar'] = 'sometimes|nullable';
        }

        $validated = $request->validate($rules);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        } else {
            // Jika tidak ada file avatar, hapus dari validated agar tidak diupdate
            unset($validated['avatar']);
        }

        // Password akan otomatis di-hash oleh model User (cast 'hashed')
        // Tidak perlu Hash::make() lagi

        $user->update($validated);

        // Reload user untuk mendapatkan data terbaru
        $user->refresh();

        // Load relations
        $user->loadMissing('ownerProfile', 'kosts');

        // Jangan ubah $user->avatar (biarkan sebagai path relatif di database)
        // avatar_url akan otomatis di-generate oleh getAvatarUrlAttribute() di model User
        // Tidak perlu set manual karena sudah ada di $appends

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'data' => $user,
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    // ===========================
    // FORGOT PASSWORD
    // ===========================
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak ditemukan',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak ditemukan',
                ], 404);
            }

            // Generate OTP untuk user
            $otp = OtpService::generateOtp($user->id);

            Log::info('🔐 [Forgot Password] OTP ('.$otp.') for user: '.$user->email);

            // Kirim email dengan OTP
            try {
                // Cek mail driver - jika log, tetap lanjutkan (untuk development)
                $mailDriver = config('mail.default');
                
                Mail::to($user->email)->send(new OtpMail($otp, 'Kode Verifikasi Reset Password'));
                
                Log::info('📧 Email OTP berhasil dikirim ke: '.$user->email);

                $message = 'Kode OTP 6 digit telah dikirim ke email Anda. Silakan cek kotak masuk/spam.';
                
                // Jika menggunakan log driver, tambahkan info dan OTP di response (untuk development)
                if ($mailDriver === 'log') {
                    $message .= ' (Email ditulis ke log file karena menggunakan log driver)';
                    // Untuk development, kirim OTP di response juga
                    if (app()->environment('local') || config('app.debug')) {
                        return response()->json([
                            'success' => true,
                            'message' => $message,
                            'email' => $user->email,
                            'otp' => $otp, // Hanya untuk development
                            'note' => 'OTP ini hanya muncul di development mode',
                        ]);
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'email' => $user->email,
                ]);
            } catch (\Exception $e) {
                Log::error('❌ Gagal mengirim email OTP ke '.$user->email.': '.$e->getMessage());
                Log::error('❌ Stack trace: '.$e->getTraceAsString());
                Log::error('❌ File: '.$e->getFile().' Line: '.$e->getLine());

                // Cek apakah ini error SMTP connection atau sender verification
                $isSmtpError = str_contains($e->getMessage(), 'Connection') || 
                              str_contains($e->getMessage(), 'SMTP') ||
                              str_contains($e->getMessage(), '550') ||
                              str_contains($e->getMessage(), 'Sender verify') ||
                              str_contains($e->getMessage(), 'No Such User') ||
                              str_contains($e->getFile(), 'SmtpTransport');

                // Return error dengan detail untuk debugging
                $errorMessage = 'Gagal mengirim email OTP. ';
                
                if ($isSmtpError) {
                    $errorMessage .= 'Pastikan konfigurasi email di .env sudah benar. ';
                    $errorMessage .= 'Pastikan MAIL_USERNAME sama dengan MAIL_FROM_ADDRESS. ';
                    $errorMessage .= 'Cek file CPANEL_EMAIL_SETUP.md untuk panduan lengkap.';
                } else {
                    $errorMessage .= 'Silakan coba lagi atau hubungi dukungan.';
                }
                
                // Di local/development environment, tambahkan detail error
                $isLocal = app()->environment('local') || config('app.debug');
                if ($isLocal) {
                    $errorMessage .= ' Error: '.$e->getMessage();
                }

                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'error_details' => $isLocal ? [
                        'message' => $e->getMessage(),
                        'file' => basename($e->getFile()),
                        'line' => $e->getLine(),
                        'smtp_error' => $isSmtpError,
                    ] : null,
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('❌ Error in forgotPassword: '.$e->getMessage());
            Log::error('❌ Stack trace: '.$e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses permintaan',
                'error_details' => app()->environment('local') ? $e->getMessage() : null,
            ], 500);
        }
    }

    // ===========================
    // VERIFY OTP FOR FORGOT PASSWORD
    // ===========================
    public function verifyOtpForgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak ditemukan',
                ], 404);
            }

            // Verify OTP menggunakan user_id (karena OTP disimpan dengan user_id)
            $otpValid = OtpService::verifyOtp($user->id, $request->otp);
            
            if (!$otpValid['ok']) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau sudah kadaluarsa',
                ], 422);
            }

            Log::info('✅ OTP berhasil diverifikasi untuk forgot password: '.$user->email);

            return response()->json([
                'success' => true,
                'message' => 'OTP berhasil diverifikasi. Silakan lanjutkan reset password.',
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error in verifyOtpForgotPassword: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memverifikasi OTP',
            ], 500);
        }
    }

    // ===========================
    // RESET PASSWORD
    // ===========================
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|same:password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email tidak ditemukan',
                ], 404);
            }

            // Verify OTP
            $otpValid = OtpService::verifyOtp($user->id, $request->otp);
            
            if (!$otpValid['ok']) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau sudah kadaluarsa',
                ], 422);
            }

            // Update password (akan di-hash otomatis oleh mutator di model User)
            $user->password = $request->password;
            $user->save();

            Log::info('✅ Password berhasil direset untuk user: '.$user->email);

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset. Silakan login dengan password baru.',
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Error in resetPassword: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mereset password',
            ], 500);
        }
    }
}
