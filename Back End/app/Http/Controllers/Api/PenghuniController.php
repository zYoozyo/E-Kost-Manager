<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penghuni; // <-- Import Model Penghuni
use Illuminate\Http\Request;

class PenghuniController extends Controller
{
    /**
     * Menampilkan semua data penghuni. (READ)
     */
    public function index()
    {
        $penghunis = Penghuni::all();
        
        return response()->json([
            'success' => true,
            'data' => $penghunis,
        ]);
    }

    /**
     * Menyimpan data penghuni baru. (CREATE)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nomor_telepon' => 'required|string',
            'email' => 'required|email|unique:penghuni',
        ]);

        $penghuni = Penghuni::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Penghuni berhasil ditambahkan',
            'data' => $penghuni,
        ], 201);
    }

    /**
     * Menampilkan satu data penghuni spesifik. (READ by ID)
     */
    public function show(Penghuni $penghuni)
    {
        return response()->json([
            'success' => true,
            'data' => $penghuni,
        ]);
    }

    /**
     * Memperbarui data penghuni. (UPDATE)
     */
    public function update(Request $request, Penghuni $penghuni)
    {
        $request->validate([
            'nama_lengkap' => 'string|max:255',
            'nomor_telepon' => 'string',
            'email' => 'email|unique:penghuni,email,' . $penghuni->id,
        ]);

        $penghuni->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Penghuni berhasil diperbarui',
            'data' => $penghuni,
        ]);
    }

    /**
     * Menghapus data penghuni. (DELETE)
     */
    public function destroy(Penghuni $penghuni)
    {
        $penghuni->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Penghuni berhasil dihapus',
        ]);
    }
}