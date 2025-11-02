<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kamar;
use App\Models\Penghuni;
use App\Models\pembayaran;
use App\Models\Complaint;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'pemilik' || $user->role === 'admin') {
            // Admin Dashboard Stats
            $totalKamar = Kamar::count();
            $kamarTersedia = Kamar::where('status', 'tersedia')->count();
            $totalPenghuni = Penghuni::count();
            $pembayaranBulanIni = pembayaran::whereMonth('created_at', now()->month)->count();
            $complaintsPending = Complaint::where('status', 'pending')->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_kamar' => $totalKamar,
                        'kamar_tersedia' => $kamarTersedia,
                        'total_penghuni' => $totalPenghuni,
                        'pembayaran_bulan_ini' => $pembayaranBulanIni,
                        'complaints_pending' => $complaintsPending,
                    ],
                    'recent_complaints' => Complaint::with(['user', 'kamar'])->latest()->limit(5)->get(),
                    'recent_payments' => pembayaran::with(['user', 'kamar'])->latest()->limit(5)->get(),
                ],
            ]);
        } else if ($user->role === 'tenant') {
            // Tenant Dashboard Stats
            $totalPembayaran = pembayaran::where('user_id', $user->id)->count();
            $pembayaranPending = pembayaran::where('user_id', $user->id)->where('status', 'pending')->count();
            $complaintsActive = Complaint::where('user_id', $user->id)->whereIn('status', ['pending', 'in_progress'])->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => [
                        'total_pembayaran' => $totalPembayaran,
                        'pembayaran_pending' => $pembayaranPending,
                        'complaints_active' => $complaintsActive,
                    ],
                    'recent_payments' => pembayaran::where('user_id', $user->id)->with('kamar')->latest()->limit(5)->get(),
                    'recent_complaints' => Complaint::where('user_id', $user->id)->with('kamar')->latest()->limit(5)->get(),
                ],
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }
}
