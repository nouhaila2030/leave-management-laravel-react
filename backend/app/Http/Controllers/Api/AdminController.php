<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\Notification;

class AdminController extends Controller
{
    public function dashboard()
    {
        try {
            $stats = [
                'pending_requests' => LeaveRequest::where('status', 'pending')->count(),
                'approved_this_month' => LeaveRequest::where('status', 'approved')
                    ->whereMonth('created_at', date('m'))
                    ->whereYear('created_at', date('Y'))
                    ->count(),
                'total_employees' => Employee::where('is_active', true)->count(),
            ];

            $recentRequests = LeaveRequest::with(['employee', 'leaveType'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'stats' => $stats,
                'recent_requests' => $recentRequests,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur dashboard admin: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors du chargement du dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPendingRequests()
    {
        try {
            $requests = LeaveRequest::with(['employee', 'leaveType'])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des demandes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ Nouvelle méthode pour les demandes approuvées
    public function getApprovedRequests()
    {
        try {
            $requests = LeaveRequest::with(['employee', 'leaveType'])
                ->where('status', 'approved')
                ->orderBy('approved_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des demandes approuvées',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approveRequest(Request $request, $id)
    {
        try {
            $leaveRequest = LeaveRequest::findOrFail($id);
            
            // Mettre à jour la demande
            $leaveRequest->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_comment' => $request->comment
            ]);

            // ✅ Créer une notification pour l'employé
            Notification::create([
                'employee_id' => $leaveRequest->employee_id,
                'title' => 'Demande de congé approuvée',
                'message' => "Votre demande de congé du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')} a été approuvée.",
                'type' => 'success',
                'data' => [
                    'leave_request_id' => $leaveRequest->id,
                    'approved_by' => $request->user()->full_name
                ]
            ]);

            // Mettre à jour le solde de congés si nécessaire
            $leaveBalance = LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->where('year', date('Y'))
                ->first();

            if ($leaveBalance) {
                $leaveBalance->used_days += $leaveRequest->total_days;
                $leaveBalance->remaining_days -= $leaveRequest->total_days;
                $leaveBalance->save();
            }

            return response()->json([
                'message' => 'Demande approuvée avec succès',
                'request' => $leaveRequest->load(['leaveType', 'employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'approbation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function rejectRequest(Request $request, $id)
    {
        try {
            $leaveRequest = LeaveRequest::findOrFail($id);
            
            $leaveRequest->update([
                'status' => 'rejected',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'admin_comment' => $request->comment
            ]);

            // ✅ Créer une notification pour l'employé
            Notification::create([
                'employee_id' => $leaveRequest->employee_id,
                'title' => 'Demande de congé refusée',
                'message' => "Votre demande de congé du {$leaveRequest->start_date->format('d/m/Y')} au {$leaveRequest->end_date->format('d/m/Y')} a été refusée." . ($request->comment ? " Motif: {$request->comment}" : ""),
                'type' => 'error',
                'data' => [
                    'leave_request_id' => $leaveRequest->id,
                    'rejected_by' => $request->user()->full_name,
                    'reason' => $request->comment
                ]
            ]);

            return response()->json([
                'message' => 'Demande refusée',
                'request' => $leaveRequest->load(['leaveType', 'employee'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du refus',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
