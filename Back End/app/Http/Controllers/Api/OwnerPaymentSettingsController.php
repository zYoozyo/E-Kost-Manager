<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use Illuminate\Http\Request;

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

        return response()->json([
            'success' => true,
            'data' => $user->ownerProfile,
        ]);
    }

    public function update(Request $request)
    {
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
        ]);

        $profile = $user->ownerProfile()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        $profile->fill($validated);
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan pembayaran berhasil diperbarui',
            'data' => $profile,
        ]);
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
                ] : null,
            ],
        ]);
    }
}
