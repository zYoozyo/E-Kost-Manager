<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OwnerPaymentSettingsController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat mengakses pengaturan pembayaran',
            ], 403);
        }

        $user->loadMissing('ownerProfile');

        $profile = $user->ownerProfile;
        
        // Add qris_image_url to response
        if ($profile) {
            $profile->qris_image_url = $profile->qris_image_url;
        }
        
        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    public function update(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hanya pemilik yang dapat mengubah pengaturan pembayaran',
                ], 403);
            }

            $validated = $request->validate([
                'bank_name' => ['sometimes', 'nullable', 'string', 'max:100'],
                'bank_account_number' => ['sometimes', 'nullable', 'string', 'max:50'],
                'bank_account_holder' => ['sometimes', 'nullable', 'string', 'max:100'],
                'qris_payload' => ['sometimes', 'nullable', 'string'],
                'qris_image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            ]);

            $profile = $user->ownerProfile()->firstOrCreate([
                'user_id' => $user->id,
            ]);

            // Handle QRIS image upload
            if ($request->hasFile('qris_image')) {
                try {
                    // Delete old QRIS image if exists
                    if ($profile->qris_image_path) {
                        Storage::disk('public')->delete($profile->qris_image_path);
                    }
                    
                    // Store new QRIS image
                    $path = $request->file('qris_image')->store('qris-images', 'public');
                    $validated['qris_image_path'] = $path;
                } catch (\Exception $e) {
                    \Log::error('QRIS upload error: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'message' => 'Gagal mengupload foto QRIS: ' . $e->getMessage(),
                    ], 500);
                }
            }

            // Remove qris_image from validated (we use qris_image_path)
            unset($validated['qris_image']);

            $profile->fill($validated);
            $profile->save();

            // Reload to get accessor
            $profile->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Pengaturan pembayaran berhasil diperbarui',
                'data' => $profile,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Payment settings update error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function tenantShow(Request $request)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat mengakses pengaturan pembayaran pemilik',
            ], 403);
        }

        $room = Kamar::with(['kost.user.ownerProfile'])
            ->where('tenant_id', $tenant->id)
            ->first();

        if (! $room || ! $room->kost || ! $room->kost->user) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        $owner = $room->kost->user;
        $owner->loadMissing('ownerProfile');
        $profile = $owner->ownerProfile;

        return response()->json([
            'success' => true,
            'data' => [
                'owner' => [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'whatsapp' => $owner->whatsapp,
                ],
                'payment_settings' => $profile ? [
                    'bank_name' => $profile->bank_name,
                    'bank_account_number' => $profile->bank_account_number,
                    'bank_account_holder' => $profile->bank_account_holder,
                    'qris_payload' => $profile->qris_payload,
                    'qris_image_url' => $profile->qris_image_url,
                ] : null,
            ],
        ]);
    }
}
