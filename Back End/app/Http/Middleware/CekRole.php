<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CekRole
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        // Pastikan user login dulu
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json([
                'message' => 'Access Denied',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
