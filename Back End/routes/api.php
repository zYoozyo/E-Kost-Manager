<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PenghuniController;
use App\Http\Controllers\Api\KamarController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/kost', [KamarController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('penghuni', PenghuniController::class)->middleware('cekrole:pemilik');
    Route::apiResource('kamar', KamarController::class)->middleware('cekrole:pemilik');
    Route::apiResource('pembayaran', PembayaranController::class)->middleware('cekrole:pemilik');
    Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('cekrole:pemilik');
});
