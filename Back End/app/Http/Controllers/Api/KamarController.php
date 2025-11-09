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
        return Kamar::all();
    }

    /**
     * Menyimpan data kamar baru.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'required|string|unique:kamars',
            'tipe_kamar' => 'required|string',
            'harga_sewa' => 'required|integer',
            'status' => 'required|in:tersedia,terisi',
        ]);

        $kamar = Kamar::create($validatedData);

        return response()->json($kamar, 201);
    }

    /**
     * Menampilkan satu data kamar spesifik.
     */
    public function show(Kamar $kamar)
    {
        return $kamar;
    }

    /**
     * Memperbarui data kamar.
     */
    public function update(Request $request, Kamar $kamar)
    {
        $validatedData = $request->validate([
            'nomor_kamar' => 'string|unique:kamars,nomor_kamar,' . $kamar->id,
            'tipe_kamar' => 'string',
            'harga_sewa' => 'integer',
            'status' => 'in:tersedia,terisi',
        ]);

        $kamar->update($validatedData);

        return response()->json($kamar);
    }

    /**
     * Menghapus data kamar.
     */
    public function destroy(Kamar $kamar)
    {
        $kamar->delete();

        return response()->json(['message' => 'Data kamar berhasil dihapus']);
    }
}