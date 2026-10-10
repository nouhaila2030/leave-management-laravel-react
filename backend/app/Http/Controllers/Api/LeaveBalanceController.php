<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;

class LeaveBalanceController extends Controller
{
    const ANNUAL_LEAVE_DAYS = 22;

    public function getBalance(Request $request)
    {
        try {
            $employee = $request->user();
            $currentYear = date('Y');
            
            // Calculer les jours utilisés cette année
            $usedDays = LeaveRequest::where('employee_id', $employee->id)
                ->where('status', 'approved')
                ->whereYear('created_at', $currentYear)
                ->sum('total_days');
            
            $totalDays = self::ANNUAL_LEAVE_DAYS;
            $remainingDays = max(0, $totalDays - $usedDays);
            
            return response()->json([
                'totalDays' => $totalDays,
                'usedDays' => $usedDays,
                'remainingDays' => $remainingDays,
                'year' => $currentYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du calcul du solde',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getEmployeeBalance($employeeId)
    {
        try {
            $currentYear = date('Y');
            
            // Calculer les jours utilisés cette année pour cet employé
            $usedDays = LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'approved')
                ->whereYear('created_at', $currentYear)
                ->sum('total_days');
            
            $totalDays = self::ANNUAL_LEAVE_DAYS;
            $remainingDays = max(0, $totalDays - $usedDays);
            
            return response()->json([
                'totalDays' => $totalDays,
                'usedDays' => $usedDays,
                'remainingDays' => $remainingDays,
                'year' => $currentYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du calcul du solde',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
