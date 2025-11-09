<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OtpService;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class OtpController extends Controller
{
    // Request OTP
    public function requestOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
    ]);

    $user = \App\Models\User::where('email', $request->email)->first();
    $otp = \App\Services\OtpService::generateOtp($user->id);

    \Log::info('OTP untuk user ' . $user->email . ': ' . $otp);

    return response()->json([
        'success' => true,
        'message' => 'OTP dikirim. (Cek laravel.log untuk demo)',
        'email' => $user->email
    ]);
}


    // Verifikasi OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();
        $res = OtpService::verifyOtp($user->id, $request->otp);

        if ($res['ok']) {
            return response()->json(['message' => 'OTP valid.']);
        } else {
            return response()->json(['message' => 'OTP invalid', 'reason' => $res['reason']], 422);
        }
    }
}
