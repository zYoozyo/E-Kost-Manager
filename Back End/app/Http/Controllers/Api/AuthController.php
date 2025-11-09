<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // ============================
    // SIGNUP
    // ============================
    public function signup(Request $request)
    {
        // Different validation rules based on role
        $role = $request->input('role', 'tenant');
        
        if ($role === 'owner') {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
                'phone' => 'required|string|max:20',
                'role' => 'required|in:owner',
                // Owner-specific fields (optional for now, can be stored in separate table later)
                'namaKost' => 'nullable|string|max:255',
                'namaPemilik' => 'nullable|string|max:255',
                'whatsapp' => 'nullable|string|max:20',
                'alamat' => 'nullable|string',
                'kodePos' => 'nullable|string|max:10',
                'provinsi' => 'nullable|string|max:100',
                'kota' => 'nullable|string|max:100',
                'kecamatan' => 'nullable|string|max:100',
                'kelurahan' => 'nullable|string|max:100',
                'pilihanPembayaran' => 'nullable|string|max:50',
            ]);
        } else {
            $validatedData = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'phone' => 'required|string|max:20',
                'access_code' => 'required|string',
                'role' => 'required|in:admin,tenant',
            ]);
        }

        // Check OTP verification for owner
        if ($role === 'owner') {
            $otpVerified = Cache::get('otp_verified_' . $validatedData['email']);
            if (!$otpVerified) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email belum terverifikasi dengan OTP'
                ], 400);
            }
            // Clear OTP cache after successful signup
            Cache::forget('otp_verified_' . $validatedData['email']);
            Cache::forget('otp_' . $validatedData['email']);
        }

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone' => $validatedData['phone'],
            'role' => $validatedData['role'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    // ============================
    // LOGIN
    // ============================
    public function login(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
            'role' => 'required|in:admin,tenant,owner',
        ]);

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password salah'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Check if role matches
        if ($user->role !== $validatedData['role']) {
            return response()->json([
                'success' => false,
                'message' => 'Role tidak sesuai'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    // ============================
    // LOGOUT
    // ============================
    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User tidak ditemukan'
                ], 404);
            }

            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Logout berhasil'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak ditemukan atau sudah logout'
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // ============================
    // REQUEST OTP
    // ============================
    public function requestOTP(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        // Generate 6-digit OTP
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes
        Cache::put('otp_' . $validatedData['email'], $otp, now()->addMinutes(10));

        // In production, send OTP via email
        // For now, we'll return it in response (should be removed in production)
        // Mail::to($validatedData['email'])->send(new OtpMail($otp));

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email Anda',
            // Remove this in production - only for development/testing
            'otp' => $otp, // REMOVE IN PRODUCTION
        ]);
    }

    // ============================
    // VERIFY OTP
    // ============================
    public function verifyOTP(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|string|email|max:255',
            'otp' => 'required|string|size:6',
        ]);

        $storedOTP = Cache::get('otp_' . $validatedData['email']);

        if (!$storedOTP) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak ditemukan atau sudah kadaluwarsa'
            ], 400);
        }

        if ($storedOTP !== $validatedData['otp']) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid'
            ], 400);
        }

        // Mark email as verified (valid for 30 minutes)
        Cache::put('otp_verified_' . $validatedData['email'], true, now()->addMinutes(30));

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi'
        ]);
    }

    // ============================
    // PROFILE
    // ============================
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
