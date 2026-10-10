<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * Obtenir les notifications de l'employé connecté
     */
    public function index(Request $request)
    {
        try {
            $employee = $request->user();
            Log::info("🔄 Récupération des notifications pour l'employé", ['employee_id' => $employee->id]);
            $notifications = Notification::where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->get();
            Log::info("✅ Notifications récupérées pour l'employé", ['count' => $notifications->count(), 'unread_count' => $notifications->where('is_read', false)->count()]);

            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $notifications->where('is_read', false)->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des notifications: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $employee = $request->user();
            $notification = Notification::where('employee_id', $employee->id)
                ->findOrFail($id);

            $notification->update(['is_read' => true]);
            Log::info("✅ Notification marquée comme lue", ['notification_id' => $id, 'employee_id' => $employee->id]);

            return response()->json([
                'message' => 'Notification marquée comme lue'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la notification: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $employee = $request->user();
            Notification::where('employee_id', $employee->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);
            Log::info("✅ Toutes les notifications marquées comme lues", ['employee_id' => $employee->id]);

            return response()->json([
                'message' => 'Toutes les notifications marquées comme lues'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de toutes les notifications: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
