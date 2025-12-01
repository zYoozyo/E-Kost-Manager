<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'Dashboard API berhasil diakses!',
            'status' => 'success',
        ]);
    }
}
