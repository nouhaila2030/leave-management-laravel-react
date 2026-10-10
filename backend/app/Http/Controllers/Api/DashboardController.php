<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * Obtenir les statistiques du dashboard admin
     */
    public function stats()
    {
        try {
            $currentYear = date('Y');

            // Statistiques générales
            $totalEmployees = Employee::where('role', 'employee')->where('is_active', true)->count();
            $totalRequests = LeaveRequest::whereYear('created_at', $currentYear)->count();
            $approvedRequests = LeaveRequest::where('status', 'approved')->whereYear('created_at', $currentYear)->count();
            $pendingRequests = LeaveRequest::where('status', 'pending')->count();
            $rejectedRequests = LeaveRequest::where('status', 'rejected')->whereYear('created_at', $currentYear)->count();

            // Demandes récentes
            $recentRequests = LeaveRequest::with(['employee'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($request) {
                    $balance = $request->employee->getLeaveBalance();
                    $request->employee_balance = $balance;
                    return $request;
                });

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
                        'balance' => $balance
                    ];
                });

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
            return response()->json([
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
