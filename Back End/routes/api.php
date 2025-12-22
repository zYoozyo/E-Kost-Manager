<?php

use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\KamarController;
use App\Http\Controllers\Api\KostController;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\RoomTypeController;
use App\Http\Controllers\Api\TestimoniController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\OwnerPaymentSettingsController;
use Illuminate\Support\Facades\Route;

// AUTHENTICATION
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/verify-otp-forgot-password', [AuthController::class, 'verifyOtpForgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::middleware('auth:sanctum')->get('/profile', [AuthController::class, 'profile']);
    Route::middleware('auth:sanctum')->put('/profile', [AuthController::class, 'updateProfile']);
    Route::middleware('auth:sanctum')->post('/profile', [AuthController::class, 'updateProfile']);
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

// PAYMENTS (REST + QRIS stubs)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/payments', [PembayaranController::class, 'index']);
    Route::post('/payments', [PembayaranController::class, 'store']);
    Route::get('/payments/{pembayaran}', [PembayaranController::class, 'show'])->whereNumber('pembayaran');
    Route::match(['put', 'patch'], '/payments/{pembayaran}', [PembayaranController::class, 'update'])->whereNumber('pembayaran');
    Route::delete('/payments/{pembayaran}', [PembayaranController::class, 'destroy'])->whereNumber('pembayaran');
    Route::post('/payments/{pembayaran}/proof', [PembayaranController::class, 'uploadProof'])->whereNumber('pembayaran');
});

Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::post('/qris/create', [PembayaranController::class, 'createQris']);
    Route::get('/qris/status/{invoiceId}', [PembayaranController::class, 'checkQrisStatus']);
    Route::get('/history', [PembayaranController::class, 'history']);
    Route::post('/generate-monthly', [PembayaranController::class, 'generateMonthlyInvoices']);
});

// Invitation routes (PUBLIC)
Route::post('/invitations/validate', [InvitationController::class, 'validateInvitation']);
Route::post('/invitations/accept', [InvitationController::class, 'accept']);

// PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    // Invitation routes
    Route::post('/invitations', [InvitationController::class, 'create']);
    Route::get('/invitations', [InvitationController::class, 'list']);
    Route::delete('/invitations/{id}', [InvitationController::class, 'delete']);
    
    // Tenant routes
    Route::get('/tenant/payment-settings', [OwnerPaymentSettingsController::class, 'tenantShow']);
    Route::get('/tenant/my-room', [KamarController::class, 'tenantRoom']);
    Route::get('/tenant/complaints', [ComplaintController::class, 'tenantIndex']);
    Route::post('/tenant/complaints', [ComplaintController::class, 'tenantStore']);
    Route::get('/tenant/complaints/{id}/responses', [ComplaintController::class, 'getResponses']);
    Route::post('/tenant/complaints/{id}/responses', [ComplaintController::class, 'addResponse']);
    Route::put('/tenant/complaints/{id}', [ComplaintController::class, 'tenantUpdate']);
    Route::delete('/tenant/complaints/{id}', [ComplaintController::class, 'tenantDestroy']);

    // Admin routes (pemilik/pengelola kost)
    Route::get('/admin/tenants', [InvitationController::class, 'tenants']);
    Route::get('/admin/rooms', [KamarController::class, 'ownerRooms']);
    Route::post('/admin/rooms', [KamarController::class, 'storeForOwner']);
    Route::put('/admin/rooms/{id}', [KamarController::class, 'updateForOwner']);
    Route::delete('/admin/rooms/{id}', [KamarController::class, 'destroyForOwner']);
    Route::put('/admin/rooms/{id}/assign-tenant', [KamarController::class, 'assignTenant']);
    Route::get('/admin/room-types', [RoomTypeController::class, 'indexForOwner']);
    Route::post('/admin/room-types', [RoomTypeController::class, 'storeForOwner']);
    Route::put('/admin/room-types/{id}', [RoomTypeController::class, 'updateForOwner']);
    Route::delete('/admin/room-types/{id}', [RoomTypeController::class, 'destroyForOwner']);
    Route::get('/admin/payments', [PembayaranController::class, 'ownerPayments']);
    Route::get('/admin/payment-settings', [OwnerPaymentSettingsController::class, 'show']);
    Route::put('/admin/payment-settings', [OwnerPaymentSettingsController::class, 'update']);
    Route::post('/admin/payment-settings', [OwnerPaymentSettingsController::class, 'update']); // For FormData uploads
    Route::get('/admin/complaints', [ComplaintController::class, 'ownerIndex']);
    Route::get('/admin/complaints/{id}/responses', [ComplaintController::class, 'getResponses']);
    Route::post('/admin/complaints/{id}/responses', [ComplaintController::class, 'addResponse']);
    Route::put('/admin/complaints/{id}/status', [ComplaintController::class, 'ownerUpdateStatus']);
});
