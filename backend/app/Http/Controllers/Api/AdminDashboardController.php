<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    /**
     * Obtenir les statistiques du dashboard admin
     */
    public function stats()
    {
        try {
            Log::info("🔄 Récupération des statistiques admin");
            $currentYear = date('Y');

            // Statistiques générales
            $totalEmployees = Employee::where('role', 'employee')->where('is_active', true)->count();
            $totalRequests = LeaveRequest::whereYear('created_at', $currentYear)->count();
            $approvedRequests = LeaveRequest::where('status', 'approved')->whereYear('created_at', $currentYear)->count();
            $pendingRequests = LeaveRequest::where('status', 'pending')->count();
            $rejectedRequests = LeaveRequest::where('status', 'rejected')->whereYear('created_at', $currentYear)->count();

            Log::info("📊 Stats calculées", [
                'total_employees' => $totalEmployees,
                'total_requests' => $totalRequests,
                'approved_requests' => $approvedRequests,
                'pending_requests' => $pendingRequests,
                'rejected_requests' => $rejectedRequests,
            ]);

            // Demandes récentes
            $recentRequests = LeaveRequest::with(['employee'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($request) {
                    if ($request->employee) {
                        $balance = $request->employee->getLeaveBalance();
                        $request->employee_balance = $balance;
                        $request->employee = $request->employee->full_name; // Simplifier pour le frontend
                        $request->startDate = Carbon::parse($request->start_date)->format('d/m/Y');
                        $request->endDate = Carbon::parse($request->end_date)->format('d/m/Y');
                        $request->days = $request->total_days;
                    } else {
                        $request->employee_balance = null;
                        $request->employee = 'Employé inconnu';
                    }
                    return $request;
                });
            Log::info("📋 Demandes récentes récupérées", ['count' => $recentRequests->count()]);

            // Employés avec leurs soldes
            $employees = Employee::where('role', 'employee')
                ->where('is_active', true)
                ->get()
                ->map(function ($employee) {
                    $balance = $employee->getLeaveBalance();
                    return [
                        'id' => $employee->id,
                        'first_name' => $employee->first_name,
                        'last_name' => $employee->last_name,
                        'full_name' => $employee->full_name,
                        'email' => $employee->email,
                        'phone' => $employee->phone,
                        'department' => $employee->department,
                        'position' => $employee->position,
                        'cin' => $employee->cin, // Ajout du CIN
                        'usedDays' => $balance['usedDays'], // Ajout des jours utilisés
                        'remainingDays' => $balance['remainingDays'], // Ajout des jours restants
                        'balance' => $balance
                    ];
                });
            Log::info("👥 Employés avec soldes récupérés", ['count' => $employees->count()]);


            return response()->json([
                'stats' => [
                    'total_employees' => $totalEmployees,
                    'total_requests' => $totalRequests,
                    'approved_requests' => $approvedRequests,
                    'pending_requests' => $pendingRequests,
                    'rejected_requests' => $rejectedRequests,
                ],
                'recent_requests' => $recentRequests,
                'employees' => $employees
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des statistiques admin: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
