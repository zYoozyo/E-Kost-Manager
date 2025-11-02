<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\pembayaran;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    // Menampilkan semua pembayaran
    public function index(Request $request)
    {
        $query = pembayaran::with(['user', 'kamar']);
        
        // Tenant hanya melihat pembayaran sendiri
        if ($request->user()->role === 'tenant') {
            $query->where('user_id', $request->user()->id);
        }
        
        $pembayarans = $query->latest()->get();
        
        return response()->json([
            'success' => true,
            'data' => $pembayarans,
        ]);
    }

    // Menyimpan pembayaran baru
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'kamar_id' => 'required|exists:kamar,id',
            'jumlah' => 'required|numeric|min:0',
            'tanggal_bayar' => 'nullable|date',
            'tanggal_jatuh_tempo' => 'required|date',
            'status' => 'nullable|in:pending,paid,overdue',
            'metode_pembayaran' => 'nullable|string',
            'keterangan' => 'nullable|string',
        ]);

        $pembayaran = pembayaran::create([
            ...$validatedData,
            'user_id' => $request->user()->role === 'tenant' ? $request->user()->id : null,
            'status' => $validatedData['status'] ?? 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil ditambahkan',
            'data' => $pembayaran->load(['user', 'kamar']),
        ], 201);
    }

    // Menampilkan detail pembayaran tertentu
    public function show(Request $request, pembayaran $pembayaran)
    {
        // Cek akses
        if ($request->user()->role === 'tenant' && $pembayaran->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $pembayaran->load(['user', 'kamar']),
        ]);
    }

    // Mengupdate data pembayaran
    public function update(Request $request, pembayaran $pembayaran)
    {
        // Tenant tidak bisa update pembayaran
        if ($request->user()->role === 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $validatedData = $request->validate([
            'jumlah' => 'sometimes|numeric|min:0',
            'tanggal_bayar' => 'sometimes|date',
            'tanggal_jatuh_tempo' => 'sometimes|date',
            'status' => 'sometimes|in:pending,paid,overdue',
            'metode_pembayaran' => 'sometimes|string',
            'keterangan' => 'sometimes|string',
        ]);

        $pembayaran->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil diperbarui',
            'data' => $pembayaran->load(['user', 'kamar']),
        ]);
    }

    // Menghapus pembayaran
    public function destroy(Request $request, pembayaran $pembayaran)
    {
        // Tenant tidak bisa hapus pembayaran
        if ($request->user()->role === 'tenant') {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak',
            ], 403);
        }

        $pembayaran->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dihapus',
        ]);
    }

    // Menampilkan pembayaran user yang sedang login
    public function myPayments(Request $request)
    {
        $pembayarans = pembayaran::where('user_id', $request->user()->id)
            ->with('kamar')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pembayarans,
        ]);
    }
}
