<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OtpService
{
    // Generate numeric OTP (default 6 digit) dan simpan ke DB
    public static function generateOtp($userId, $length = 6, $ttl_seconds = 300)
    {
        $otp = '';
        for ($i = 0; $i < $length; $i++) {
            $otp .= strval(random_int(0, 9));
        }

        $salt = bin2hex(random_bytes(16));
        $otp_hash = hash_hmac('sha256', $otp, $salt);
        $expires_at = Carbon::now()->addSeconds($ttl_seconds)->toDateTimeString();

        DB::table('otps')->updateOrInsert(
            ['user_id' => $userId],
            [
                'otp_hash' => $otp_hash,
                'salt' => $salt,
                'expires_at' => $expires_at,
                'attempts' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        );

        return $otp; // Kembalikan OTP untuk dikirim via email/SMS
    }

    // Verifikasi OTP
    public static function verifyOtp($userId, $otpInput, $maxAttempts = 3)
    {
        $row = DB::table('otps')->where('user_id', $userId)->first();
        if (!$row) return ['ok' => false, 'reason' => 'no_otp'];

        if (Carbon::now()->gt(Carbon::parse($row->expires_at))) {
            DB::table('otps')->where('user_id', $userId)->delete();
            return ['ok' => false, 'reason' => 'expired'];
        }

        if ($row->attempts >= $maxAttempts) {
            return ['ok' => false, 'reason' => 'blocked'];
        }

        $input_hash = hash_hmac('sha256', $otpInput, $row->salt);
        if (hash_equals($input_hash, $row->otp_hash)) {
            DB::table('otps')->where('user_id', $userId)->delete();
            return ['ok' => true, 'reason' => 'ok'];
        } else {
            DB::table('otps')->where('user_id', $userId)->increment('attempts');
            return ['ok' => false, 'reason' => 'wrong'];
        }
    }
}
