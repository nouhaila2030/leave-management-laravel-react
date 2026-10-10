<?php


namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller; // <-- Ajoute cette ligne
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LeaveHistoryApiController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Si c'est un admin → il voit tout
        if ($user->is_admin) {
            $history = LeaveRequest::with(['employee', 'approvedBy'])
                        ->orderBy('created_at', 'desc')
                        ->get();
        } else {
            // Sinon → il ne voit que ses propres demandes
            $history = LeaveRequest::with(['employee', 'approvedBy'])
                        ->where('employee_id', $user->employee->id)
                        ->orderBy('created_at', 'desc')
                        ->get();
        }

        return response()->json($history);
    }
}
