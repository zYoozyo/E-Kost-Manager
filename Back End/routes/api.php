<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PenghuniController;
use App\Http\Controllers\Api\KamarController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\DashboardController;

// Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('signup', [AuthController::class, 'signup']);
    Route::post('request-otp', [AuthController::class, 'requestOTP']);
    Route::post('verify-otp', [AuthController::class, 'verifyOTP']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// Kost Management Routes (Admin)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('kosts', KamarController::class)->middleware('cekrole:pemilik');
    Route::apiResource('tenants', PenghuniController::class)->middleware('cekrole:pemilik');
    Route::apiResource('payments', PembayaranController::class)->middleware('cekrole:pemilik');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('cekrole:pemilik');

    // Tenant specific routes
    Route::get('/my-kost', [KamarController::class, 'myKost']);
    Route::get('/my-payments', [PembayaranController::class, 'myPayments']);
    Route::apiResource('complaints', \App\Http\Controllers\Api\ComplaintController::class);
    Route::get('/my-complaints', [\App\Http\Controllers\Api\ComplaintController::class, 'myComplaints']);
});
