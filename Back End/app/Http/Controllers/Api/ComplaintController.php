<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    /**
     * Menampilkan semua komplain.
     */
    public function index(Request $request)
    {
        $query = Complaint::with(['user', 'kamar']);
        
        // Admin melihat semua komplain
        // Tenant hanya melihat komplain sendiri
        if ($request->user()->role === 'tenant') {
            $query->where('user_id', $request->user()->id);
        }
        
        $complaints = $query->latest()->get();
        
        return response()->json([
            'success' => true,
            'data' => $complaints,
        ]);
    }

    /**
     * Menyimpan komplain baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'nullable|in:low,medium,high',
            'kamar_id' => 'nullable|exists:kamar,id',
        ]);

        $complaint = Complaint::create([
            ...$validatedData,
            'user_id' => $request->user()->id,
            'status' => 'pending',
            'priority' => $validatedData['priority'] ?? 'medium',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Komplain berhasil dikirim',
            'data' => $complaint->load(['user', 'kamar']),
        ], 201);
    }

    /**
     * Menampilkan komplain tertentu.
     */
    public function show(Request $request, Complaint $complaint)
    {
        // Cek akses
        if ($request->user()->role === 'tenant' && $complaint->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $complaint->load(['user', 'kamar']),
        ]);
    }

    /**
     * Mengupdate komplain.
     */
    public function update(Request $request, Complaint $complaint)
    {
        // Tenant hanya bisa update komplain sendiri
        if ($request->user()->role === 'tenant' && $complaint->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:pending,in_progress,resolved',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        $complaint->update($validatedData);
        
        if (isset($validatedData['status']) && $validatedData['status'] === 'resolved') {
            $complaint->update(['resolved_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Komplain berhasil diperbarui',
            'data' => $complaint->load(['user', 'kamar']),
        ]);
    }

    /**
     * Menghapus komplain.
     */
    public function destroy(Request $request, Complaint $complaint)
    {
        // Tenant hanya bisa hapus komplain sendiri
        if ($request->user()->role === 'tenant' && $complaint->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $complaint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Komplain berhasil dihapus',
        ]);
    }

    /**
     * Menampilkan komplain user yang sedang login.
     */
    public function myComplaints(Request $request)
    {
        $complaints = Complaint::where('user_id', $request->user()->id)
            ->with('kamar')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $complaints,
        ]);
    }
}

