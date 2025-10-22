<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PembayaranController extends Controller
{
    // Menampilkan semua pembayaran
    public function index()
    {
        return response()->json([
            'message' => 'Daftar pembayaran berhasil diakses',
            'status' => 'success'
        ]);
    }

    // Menyimpan pembayaran baru
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'Pembayaran baru berhasil ditambahkan',
            'status' => 'success'
        ]);
    }

    // Menampilkan detail pembayaran tertentu
    public function show($id)
    {
        return response()->json([
            'message' => "Detail pembayaran ID $id berhasil diakses",
            'status' => 'success'
        ]);
    }

    // Mengupdate data pembayaran
    public function update(Request $request, $id)
    {
        return response()->json([
            'message' => "Pembayaran ID $id berhasil diperbarui",
            'status' => 'success'
        ]);
    }

    // Menghapus pembayaran
    public function destroy($id)
    {
        return response()->json([
            'message' => "Pembayaran ID $id berhasil dihapus",
            'status' => 'success'
        ]);
    }
}
