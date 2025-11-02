<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use Illuminate\Http\Request;

class KamarController extends Controller
{
    /**
     * Menampilkan semua data kamar.
     */
    public function index()
    {
        $kamars = Kamar::all();
        
        return response()->json([
            'success' => true,
            'data' => $kamars,
        ]);
    }

    /**
     * Menyimpan data kamar baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'required|string|unique:kamar',
            'tipe_kamar' => 'required|string',
            'harga_sewa' => 'required|integer',
            'status' => 'required|in:tersedia,terisi',
        ]);

        $kamar = Kamar::create($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil ditambahkan',
            'data' => $kamar,
        ], 201);
    }

    /**
     * Menampilkan satu data kamar spesifik.
     */
    public function show(Kamar $kamar)
    {
        return response()->json([
            'success' => true,
            'data' => $kamar,
        ]);
    }

    /**
     * Memperbarui data kamar.
     */
    public function update(Request $request, Kamar $kamar)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'string|unique:kamar,nomor_kamar,' . $kamar->id,
            'tipe_kamar' => 'string',
            'harga_sewa' => 'integer',
            'status' => 'in:tersedia,terisi',
        ]);

        $kamar->update($validatedData);

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data' => $kamar,
        ]);
    }

    /**
     * Menghapus data kamar.
     */
    public function destroy(Kamar $kamar)
    {
        $kamar->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    /**
     * Menampilkan kamar user yang sedang login.
     */
    public function myKost(Request $request)
    {
        // TODO: Implementasi jika kamar punya relasi dengan penghuni
        $kamars = Kamar::where('status', 'terisi')->get();
        
        return response()->json([
            'success' => true,
            'data' => $kamars,
        ]);
    }
}