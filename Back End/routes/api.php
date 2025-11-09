<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KostController;
use App\Http\Controllers\Api\TestimoniController;
use App\Http\Controllers\Api\OtpController;

// AUTHENTICATION
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

// KOST Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/kost', [KostController::class, 'store']);
});

// TESTIMONI
Route::get('/testimoni', [TestimoniController::class, 'index']);
Route::post('/testimoni', [TestimoniController::class, 'store']);

// OTP Routes
Route::prefix('otp')->group(function () {
    Route::post('/request', [OtpController::class, 'requestOtp']);
    Route::post('/verify', [OtpController::class, 'verifyOtp']);
});

Route::get('/test-api', function () {
    return response()->json(['ok' => true]);
});