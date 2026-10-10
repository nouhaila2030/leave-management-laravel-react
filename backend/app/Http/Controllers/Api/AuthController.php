<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Employee;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            // Après la validation, ajoutez :
            \Log::info("🔍 Tentative de connexion", [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // 🔍 Debug: Vérifier si l'utilisateur existe
            $employee = Employee::where('email', $request->email)->first();
            
            if (!$employee) {
                \Log::info("❌ Utilisateur non trouvé: " . $request->email);
                return response()->json([
                    'message' => 'Utilisateur non trouvé avec cet email'
                ], 401);
            }

            \Log::info("✅ Utilisateur trouvé: " . $employee->email . " - Role: " . $employee->role);

            // 🔍 Debug: Vérifier le mot de passe
            if (!Hash::check($request->password, $employee->password)) {
                \Log::info("❌ Mot de passe incorrect pour: " . $request->email);
                return response()->json([
                    'message' => 'Mot de passe incorrect'
                ], 401);
            }

            \Log::info("✅ Mot de passe correct pour: " . $employee->email);

            // Vérifier si le compte est actif
            if (!$employee->is_active) {
                return response()->json([
                    'message' => 'Compte désactivé'
                ], 401);
            }

            // ✅ CRÉER LE TOKEN AVEC LE BON GUARD
            $token = $employee->createToken('auth-token', ['*'])->plainTextToken;

            \Log::info("✅ Token créé pour: " . $employee->email . " - Role: " . $employee->role);

            // Après la création du token, ajoutez :
            \Log::info("🎯 Réponse de connexion préparée", [
                'user_id' => $employee->id,
                'user_role' => $employee->role,
                'token_length' => strlen($token),
                'response_structure' => [
                    'message' => 'Connexion réussie',
                    'user_keys' => array_keys([
                        'id' => $employee->id,
                        'full_name' => $employee->full_name,
                        'first_name' => $employee->first_name,
                        'last_name' => $employee->last_name,
                        'email' => $employee->email,
                        'role' => $employee->role,
                        'department' => $employee->department,
                        'position' => $employee->position,
                    ]),
                    'has_token' => !empty($token)
                ]
            ]);

            return response()->json([
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $employee->id,
                    'full_name' => $employee->full_name,
                    'first_name' => $employee->first_name,
                    'last_name' => $employee->last_name,
                    'email' => $employee->email,
                    'role' => $employee->role,
                    'department' => $employee->department,
                    'position' => $employee->position,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Données invalides',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur login: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur serveur lors de la connexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // ✅ SUPPRESSION CORRECTE DU TOKEN
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Déconnexion réussie']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();
            
            \Log::info('Route /me appelée pour utilisateur:', [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role
            ]);
            
            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department,
                    'position' => $user->position,
                    'cin' => $user->cin,
                'phone' => $user->phone,
                'address' => $user->address,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur /me: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
