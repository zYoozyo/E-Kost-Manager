<?php

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
    Route::middleware('auth:sanctum')->get('/profile', [AuthController::class, 'profile']);
    // Allow both PUT and POST methods to update profile (POST is used for multipart/form-data uploads)
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

// Invitation routes
Route::post('/invitations/validate', [InvitationController::class, 'validateInvitation']);
Route::post('/invitations/accept', [InvitationController::class, 'accept']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/invitations', [InvitationController::class, 'create']);
    Route::get('/invitations', [InvitationController::class, 'list']);
    Route::delete('/invitations/{id}', [InvitationController::class, 'delete']);
    // List tenants associated with the authenticated owner via accepted invitations
    Route::get('/owner/tenants', [InvitationController::class, 'tenants']);

    // Owner rooms management
    Route::get('/owner/rooms', [KamarController::class, 'ownerRooms']);
    Route::post('/owner/rooms', [KamarController::class, 'storeForOwner']);
    Route::put('/owner/rooms/{id}', [KamarController::class, 'updateForOwner']);
    Route::delete('/owner/rooms/{id}', [KamarController::class, 'destroyForOwner']);
    Route::put('/owner/rooms/{id}/assign-tenant', [KamarController::class, 'assignTenant']);

    // Owner room types management
    Route::get('/owner/room-types', [RoomTypeController::class, 'indexForOwner']);
    Route::post('/owner/room-types', [RoomTypeController::class, 'storeForOwner']);
    Route::put('/owner/room-types/{id}', [RoomTypeController::class, 'updateForOwner']);
    Route::delete('/owner/room-types/{id}', [RoomTypeController::class, 'destroyForOwner']);

    // Owner payment settings (owner & tenant views)
    Route::get('/owner/payment-settings', [OwnerPaymentSettingsController::class, 'show']);
    Route::put('/owner/payment-settings', [OwnerPaymentSettingsController::class, 'update']);
    Route::get('/tenant/payment-settings', [OwnerPaymentSettingsController::class, 'tenantShow']);

    // Tenant: get my room & kost info
    Route::get('/tenant/my-room', [KamarController::class, 'tenantRoom']);

    // Tenant complaints
    Route::get('/tenant/complaints', [ComplaintController::class, 'tenantIndex']);
    Route::post('/tenant/complaints', [ComplaintController::class, 'tenantStore']);
    Route::get('/tenant/complaints/{id}/responses', [ComplaintController::class, 'getResponses']);
    Route::post('/tenant/complaints/{id}/responses', [ComplaintController::class, 'addResponse']);
    Route::put('/tenant/complaints/{id}', [ComplaintController::class, 'tenantUpdate']);
    Route::delete('/tenant/complaints/{id}', [ComplaintController::class, 'tenantDestroy']);

    // Owner complaints
    Route::get('/owner/complaints', [ComplaintController::class, 'ownerIndex']);
    Route::get('/owner/complaints/{id}/responses', [ComplaintController::class, 'getResponses']);
    Route::post('/owner/complaints/{id}/responses', [ComplaintController::class, 'addResponse']);
    Route::put('/owner/complaints/{id}/status', [ComplaintController::class, 'ownerUpdateStatus']);
});

Route::get('/test-api', function () {
    return response()->json(['ok' => true]);
});
