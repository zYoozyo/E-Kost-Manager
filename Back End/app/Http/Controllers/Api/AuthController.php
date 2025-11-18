<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
                if (!$otpValid['ok']) {
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
                'pilihanPembayaran' => 'required_if:role,admin|string|max:50',
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
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'phone' => $validated['whatsapp'] ?? null,
                'whatsapp' => $validated['whatsapp'] ?? null,
            ]);

            // Create admin profile if role is admin
            if ($validated['role'] === 'admin') {
                $user->ownerProfile()->create([
                    'nama_kost' => $validated['namaKost'],
                    'alamat' => $validated['alamat'],
                    'kode_pos' => $validated['kodePos'],
                    'provinsi' => $validated['provinsi'],
                    'kota' => $validated['kota'],
                    'kecamatan' => $validated['kecamatan'],
                    'kelurahan' => $validated['kelurahan'],
                    'pilihan_pembayaran' => $validated['pilihanPembayaran'],
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
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ===========================
    // LOGIN
    // ===========================
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|string',
        ]);

        // cari user berdasarkan email dan role
        $user = User::where('email', $request->email)
            ->where('role', $request->role)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah!'
            ], 401);
        }

        // buat token Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // ===========================
    // PROFILE
    // ===========================
    public function profile(Request $request)
    {
        $user = $request->user();

        // Ensure avatar URL is full URL if exists
        if ($user->avatar) {
            $user->avatar = asset('storage/' . $user->avatar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diambil',
            'data' => $user,
        ]);
    }

    // ===========================
    // UPDATE PROFILE
    // ===========================
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'whatsapp' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'password' => 'sometimes|string|min:6|confirmed',
            'avatar' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // Ensure avatar URL is full URL
        if ($user->avatar) {
            $user->avatar = asset('storage/' . $user->avatar);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profile berhasil diperbarui',
            'data' => $user,
        ]);
    }

    // ===========================
    // LOGOUT
    // ===========================
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
}
