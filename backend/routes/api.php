<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\LeaveHistoryApiController;
use Illuminate\Support\Facades\Log;

// Ajoutez cette ligne tout en haut du fichier, avant toute définition de route
// (par exemple, juste après les `use` statements)
Log::info('DEBUG: routes/api.php loaded');

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Routes pour les demandes de congés
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/my-requests', [LeaveRequestController::class, 'myRequests']);
    Route::post('/calculate-days', [LeaveRequestController::class, 'calculateDays']);
    // Nouvelle route pour l'employé pour télécharger son attestation
    Route::get('/leave-requests/{id}/certificate', [LeaveRequestController::class, 'generateCertificate']);


    // Routes pour les notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    //Routes pour les historique 
//Route::get('/leave-history', [LeaveHistoryController::class, 'index']);

Route::get('/history', [LeaveHistoryApiController::class, 'index'])->middleware('auth:sanctum');

//Route::middleware('auth:sanctum')->get('/history', [LeaveHistoryApiController::class, 'index']);
//Route::get('/history', [LeaveHistoryApiController::class, 'index']);

    // Routes admin seulement
    Route::middleware('admin')->group(function () {
        Route::get('/admin/dashboard/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/admin/leave-requests', [LeaveRequestController::class, 'index']);
        Route::put('/admin/leave-requests/{id}/status', [LeaveRequestController::class, 'updateStatus']);
        Route::get('/admin/approved-requests', [LeaveRequestController::class, 'approvedRequests']);
    });
});
