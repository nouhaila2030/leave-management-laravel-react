<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveBalance;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        try {
            $employee = $request->user();

            $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'cin' => 'nullable|string|max:20',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:500',
            ]);

            // Mettre à jour les informations
            $employee->update([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'cin' => $request->cin,
                'phone' => $request->phone,
                'address' => $request->address,
            ]);

            // Récupérer les soldes de congés
            $leaveBalances = LeaveBalance::with('leaveType')
                ->where('employee_id', $employee->id)
                ->where('year', date('Y'))
                ->get();

            // Calculer les totaux
            $totalAllocatedDays = $leaveBalances->sum('allocated_days');
            $totalRemainingDays = $leaveBalances->sum('remaining_days');

            // Informations personnelles mises à jour
            $personalInfo = [
                'first_name' => $employee->first_name,
                'last_name' => $employee->last_name,
                'full_name' => $employee->full_name,
                'email' => $employee->email,
                'cin' => $employee->cin,
                'phone' => $employee->phone,
                'address' => $employee->address,
                'department' => $employee->department,
                'position' => $employee->position,
                'hire_date' => $employee->hire_date,
                'total_leave_days' => $totalAllocatedDays,
                'remaining_leave_days' => $totalRemainingDays,
            ];

            return response()->json([
                'message' => 'Informations mises à jour avec succès',
                'employee' => $employee->fresh(),
                'personal_info' => $personalInfo,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
