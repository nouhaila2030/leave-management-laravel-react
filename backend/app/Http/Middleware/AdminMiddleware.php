<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est connecté
        if (!$request->user()) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        // Vérifier si l'utilisateur est admin
      
    // Log l'utilisateur et son rôle
    Log::info('Middleware Admin : utilisateur connecté', [
        'id' => $request->user()->id,
        'email' => $request->user()->email,
        'role' => $request->user()->role,
    ]);

    if (!$request->user()->isAdmin()) {
        Log::warning('Middleware Admin : accès refusé pour utilisateur non admin', [
            'id' => $request->user()->id,
            'role' => $request->user()->role,
        ]);

        return response()->json([
            'message' => 'Accès non autorisé. Droits administrateur requis.'
        ], 403);
    }

    return $next($request);
}}
