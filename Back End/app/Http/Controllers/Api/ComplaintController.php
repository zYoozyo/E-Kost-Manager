<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintResponse;
use App\Models\Kamar;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function tenantIndex(Request $request)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat mengakses aduan ini',
            ], 403);
        }

        $complaints = Complaint::where('tenant_id', $tenant->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints,
        ]);
    }

    public function tenantStore(Request $request)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat membuat aduan',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $room = Kamar::where('tenant_id', $tenant->id)->first();

        if (! $room) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum memiliki kamar, tidak dapat membuat aduan',
            ], 422);
        }

        $complaint = Complaint::create([
            'tenant_id' => $tenant->id,
            'kost_id' => $room->kost_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Aduan berhasil dibuat',
            'data' => $complaint,
        ], 201);
    }

    public function tenantUpdate(Request $request, $id)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat mengubah aduan',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $complaint = Complaint::where('id', $id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (! $complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        if ($complaint->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Aduan yang sedang diproses atau selesai tidak dapat diubah',
            ], 422);
        }

        $complaint->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Aduan berhasil diperbarui',
            'data' => $complaint,
        ]);
    }

    public function tenantDestroy(Request $request, $id)
    {
        $tenant = $request->user();

        if ($tenant->role !== 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya penyewa yang dapat menghapus aduan',
            ], 403);
        }

        $complaint = Complaint::where('id', $id)
            ->where('tenant_id', $tenant->id)
            ->first();

        if (! $complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        if ($complaint->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Aduan yang sedang diproses atau selesai tidak dapat dihapus',
            ], 422);
        }

        $complaint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aduan berhasil dihapus',
        ]);
    }

    public function ownerIndex(Request $request)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat mengakses aduan penyewa',
            ], 403);
        }

        $kostIds = $owner->kosts()->pluck('id');

        if ($kostIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $complaints = Complaint::with('tenant')
            ->whereIn('kost_id', $kostIds)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints,
        ]);
    }

    public function ownerUpdateStatus(Request $request, $id)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat mengubah status aduan',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,resolved',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $kostIds = $owner->kosts()->pluck('id');

        $complaint = Complaint::where('id', $id)
            ->whereIn('kost_id', $kostIds)
            ->first();

        if (! $complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        $complaint->status = $validated['status'];

        if (isset($validated['priority'])) {
            $complaint->priority = $validated['priority'];
        }

        $complaint->save();

        return response()->json([
            'success' => true,
            'message' => 'Status aduan berhasil diperbarui',
            'data' => $complaint->load('tenant'),
        ]);
    }

    /**
     * Get responses for a specific complaint
     */
    public function getResponses(Request $request, $id)
    {
        $user = $request->user();
        
        $complaint = Complaint::with(['responses', 'responses.user'])->find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        // Check if user has access to this complaint
        if ($user->role === 'tenant' && $complaint->tenant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke aduan ini',
            ], 403);
        }

        if ($user->role === 'admin') {
            $ownerKostIds = $user->kosts()->pluck('id');
            if (!$ownerKostIds->contains($complaint->kost_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke aduan ini',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $complaint->responses,
        ]);
    }

    /**
     * Add a response to a complaint
     */
    public function addResponse(Request $request, $id)
    {
        $user = $request->user();
        
        $complaint = Complaint::find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        // Validate access
        if ($user->role === 'tenant' && $complaint->tenant_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke aduan ini',
            ], 403);
        }

        if ($user->role === 'admin') {
            $ownerKostIds = $user->kosts()->pluck('id');
            if (!$ownerKostIds->contains($complaint->kost_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses ke aduan ini',
                ], 403);
            }
        }

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:2000',
        ]);

        // Create the response
        $response = $complaint->addResponse($validated, $user->id, $user->role === 'admin');

        // Update complaint status if it's the owner responding
        if ($user->role === 'admin' && $complaint->status === 'pending') {
            $complaint->update(['status' => 'in_progress']);
        }

        // Load user relationship for the response
        $response->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Balasan berhasil ditambahkan',
            'data' => $response,
        ], 201);
    }

    /**
     * Update a complaint status (for owner)
     */
    public function updateStatus(Request $request, $id)
    {
        $owner = $request->user();

        if ($owner->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pemilik yang dapat mengubah status aduan',
            ], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,resolved',
        ]);

        $complaint = Complaint::find($id);

        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan',
            ], 404);
        }

        // Check if owner has access to this complaint's kost
        $ownerKostIds = $owner->kosts()->pluck('id');
        if (!$ownerKostIds->contains($complaint->kost_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke aduan ini',
            ], 403);
        }

        $complaint->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status aduan berhasil diperbarui',
            'data' => $complaint,
        ]);
    }
}
