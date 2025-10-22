<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ============================
    // REGISTER
    // ============================
    public function register(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            // 🔹 tambahkan admin ke daftar role yang valid
            'role' => 'required|in:pemilik,penyewa,admin',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'role' => $validatedData['role'],
        ]);

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => $user,
        ], 201);
    }

    // ============================
    // LOGIN
    // ============================
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Email atau Password salah'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
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
                return response()->json(['message' => 'User tidak ditemukan'], 404);
            }

            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
                return response()->json(['message' => 'Logout berhasil']);
            } else {
                return response()->json(['message' => 'Token tidak ditemukan atau sudah logout'], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan server',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
