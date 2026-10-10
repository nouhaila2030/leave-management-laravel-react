<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use App\Models\Employee;
use App\Models\Notification;
use App\Services\HolidayService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Barryvdh\DomPDF\Facade\Pdf;

class LeaveRequestController extends Controller
{
  /**
   * Créer une nouvelle demande de congé
   */
  public function store(Request $request)
  {
      try {
          Log::info("🔄 Début création demande de congé", [
              'user_id' => $request->user()->id,
              'data' => $request->all()
          ]);

          // Validation des données
          $validatedData = $request->validate([
              'leave_type' => 'required|string|in:annual,sick,maternity,emergency',
              'start_date' => 'required|date|after_or_equal:today',
              'end_date' => 'required|date|after_or_equal:start_date',
              'reason' => 'required|string|max:500'
          ]);

          Log::info("✅ Validation réussie", $validatedData);

          $employee = $request->user();
          Log::info("👤 Employé récupéré", [
              'id' => $employee->id,
              'email' => $employee->email,
              'role' => $employee->role
          ]);

          $startDate = Carbon::parse($validatedData['start_date']);
          $endDate = Carbon::parse($validatedData['end_date']);

          Log::info("📅 Dates parsées", [
              'start_date' => $startDate->toDateString(),
              'end_date' => $endDate->toDateString()
          ]);

          // Vérifier si l'employé peut prendre ces congés
          $canTake = $employee->canTakeLeave($startDate, $endDate);
          Log::info("🔍 Vérification solde", $canTake);
          
          if (!$canTake['can_take']) {
              Log::warning("❌ Solde insuffisant", $canTake);
              return response()->json([
                  'message' => $canTake['reason'],
                  'error_type' => 'validation_error'
              ], 422);
          }

          // Créer la demande
          Log::info("🔄 Création de la demande en base...");
          
          $leaveRequestData = [
              'employee_id' => $employee->id,
              'leave_type' => $validatedData['leave_type'],
              'start_date' => $startDate->toDateString(),
              'end_date' => $endDate->toDateString(),
              'reason' => $validatedData['reason'],
              'status' => 'pending'
          ];

          Log::info("📝 Données à insérer", $leaveRequestData);

          $leaveRequest = LeaveRequest::create($leaveRequestData);

          Log::info("✅ Demande créée avec succès", [
              'id' => $leaveRequest->id,
              'total_days' => $leaveRequest->total_days,
              'status' => $leaveRequest->status // Ajout du statut
          ]);

          // Créer une notification pour l'admin
          $adminEmployees = Employee::where('role', 'admin')->get();
          foreach ($adminEmployees as $admin) {
              Notification::create([
                  'employee_id' => $admin->id,
                  'title' => 'Nouvelle demande de congé en attente',
                  'message' => "L'employé {$employee->full_name} a soumis une demande de congé du " . 
                               $startDate->format('d/m/Y') . " au " . $endDate->format('d/m/Y') . 
                               " pour {$leaveRequest->total_days} jours.",
                  'type' => 'leave_request_pending',
                  'is_read' => false,
                  'related_id' => $leaveRequest->id,
                  'related_type' => 'leave_request'
              ]);
              Log::info("🔔 Notification créée pour admin", [
                  'admin_id' => $admin->id,
                  'request_id' => $leaveRequest->id
              ]);
          }


          // Charger la relation employee
          $leaveRequest->load('employee');

          return response()->json([
              'message' => 'Demande de congé envoyée avec succès',
              'leave_request' => $leaveRequest,
              'working_days' => $leaveRequest->total_days,
              'remaining_days' => $canTake['remaining_days']
          ], 201);

      } catch (ValidationException $e) {
          Log::error("❌ Erreur de validation", [
              'errors' => $e->errors(),
              'message' => $e->getMessage()
          ]);
          
          return response()->json([
              'message' => 'Données invalides',
              'errors' => $e->errors()
          ], 422);

      } catch (\Exception $e) {
          Log::error("💥 Erreur création demande congé", [
              'message' => $e->getMessage(),
              'file' => $e->getFile(),
              'line' => $e->getLine(),
              'trace' => $e->getTraceAsString()
          ]);
          
          return response()->json([
              'message' => 'Erreur lors de la création de la demande',
              'error' => $e->getMessage(),
              'debug' => [
                  'file' => $e->getFile(),
                  'line' => $e->getLine()
              ]
          ], 500);
      }
  }

  /**
   * Calculer les jours ouvrables pour une période
   */
  public function calculateDays(Request $request)
  {
      try {
          $request->validate([
              'start_date' => 'required|date',
              'end_date' => 'required|date|after_or_equal:start_date'
          ]);

          $startDate = Carbon::parse($request->start_date);
          $endDate = Carbon::parse($request->end_date);
          $workingDays = HolidayService::calculateWorkingDays($startDate, $endDate);

          $employee = $request->user();
          $balance = $employee->getLeaveBalance($startDate->year);

          return response()->json([
              'working_days' => $workingDays,
              'total_days_available' => $balance['totalDays'],
              'used_days' => $balance['usedDays'],
              'remaining_days' => $balance['remainingDays'],
              'can_take' => $workingDays <= $balance['remainingDays']
          ]);

      } catch (\Exception $e) {
          Log::error('Erreur calcul jours: ' . $e->getMessage());
          return response()->json([
              'message' => 'Erreur lors du calcul',
              'error' => $e->getMessage()
          ], 500);
      }
  }

  /**
   * Obtenir les demandes de l'employé connecté
   */
  public function myRequests(Request $request)
  {
      try {
          $employee = $request->user();
          Log::info("🔄 Récupération des demandes pour l'employé", ['employee_id' => $employee->id]);
          $requests = LeaveRequest::where('employee_id', $employee->id)
              ->with(['approvedBy'])
              ->orderBy('created_at', 'desc')
              ->get();
          Log::info("✅ Demandes récupérées pour l'employé", ['count' => $requests->count(), 'requests_ids' => $requests->pluck('id')->toArray()]);

          return response()->json([
              'requests' => $requests,
              'balance' => $employee->getLeaveBalance()
          ]);

      } catch (\Exception $e) {
          Log::error('Erreur récupération demandes: ' . $e->getMessage());
          return response()->json([
              'message' => 'Erreur lors de la récupération des demandes',
              'error' => $e->getMessage()
          ], 500);
      }
  }

  /**
   * Obtenir toutes les demandes (admin seulement)
   */
  public function index(Request $request)
  {
      try {
          Log::info("🔄 Récupération de toutes les demandes pour l'admin");
          $requests = LeaveRequest::with(['employee'])
              ->orderBy('created_at', 'desc')
              ->get()
              ->map(function ($request) {
                  // Assurez-vous que l'employé existe avant d'appeler getLeaveBalance
                  if ($request->employee) {
                      $balance = $request->employee->getLeaveBalance();
                      $request->employee_balance = $balance;
                  } else {
                      $request->employee_balance = null; // Ou une valeur par défaut
                  }
                  return $request;
              });
          Log::info("✅ Toutes les demandes récupérées pour l'admin", ['count' => $requests->count(), 'requests_ids' => $requests->pluck('id')->toArray()]);

          return response()->json(['requests' => $requests]);

      } catch (\Exception $e) {
          Log::error('Erreur récupération toutes demandes: ' . $e->getMessage());
          return response()->json([
              'message' => 'Erreur lors de la récupération des demandes',
              'error' => $e->getMessage()
          ], 500);
      }
  }

  /**
   * Approuver ou rejeter une demande (admin seulement)
   */
  public function updateStatus(Request $request, $id)
  {
      try {
          $request->validate([
              'status' => 'required|in:approved,rejected',
              'admin_comment' => 'nullable|string|max:500'
          ]);

          $leaveRequest = LeaveRequest::with('employee')->findOrFail($id);
          $admin = $request->user();

          $leaveRequest->update([
              'status' => $request->status,
              'admin_comment' => $request->admin_comment,
              'approved_by' => $admin->id,
              'approved_at' => now()
          ]);

          // Créer une notification pour l'employé
          $notificationTitle = $request->status === 'approved' 
              ? 'Demande de congé approuvée' 
              : 'Demande de congé rejetée';

          $notificationMessage = $request->status === 'approved'
              ? "Votre demande de congé du " . Carbon::parse($leaveRequest->start_date)->format('d/m/Y') . 
                " au " . Carbon::parse($leaveRequest->end_date)->format('d/m/Y') . " a été approuvée."
              : "Votre demande de congé du " . Carbon::parse($leaveRequest->start_date)->format('d/m/Y') . 
                " au " . Carbon::parse($leaveRequest->end_date)->format('d/m/Y') . " a été rejetée.";

          if ($request->admin_comment) {
              $notificationMessage .= " Commentaire: " . $request->admin_comment;
          }

          Notification::create([
              'employee_id' => $leaveRequest->employee_id,
              'title' => $notificationTitle,
              'message' => $notificationMessage,
              'type' => 'leave_request',
              'is_read' => false,
              'related_id' => $leaveRequest->id,
              'related_type' => 'leave_request'
          ]);

          Log::info("Demande de congé mise à jour", [
              'request_id' => $id,
              'status' => $request->status,
              'admin_id' => $admin->id
          ]);

          return response()->json([
              'message' => 'Statut de la demande mis à jour avec succès',
              'leave_request' => $leaveRequest->load(['employee', 'approvedBy'])
          ]);

      } catch (\Exception $e) {
          Log::error('Erreur mise à jour statut: ' . $e->getMessage());
          return response()->json([
              'message' => 'Erreur lors de la mise à jour',
              'error' => $e->getMessage()
          ], 500);
      }
  }

  /**
   * Obtenir les demandes approuvées (admin)
   */
  public function approvedRequests()
  {
      try {
          Log::info("🔄 Récupération des demandes approuvées pour l'admin");
          $requests = LeaveRequest::where('status', 'approved')
              ->with(['employee', 'approvedBy'])
              ->orderBy('approved_at', 'desc')
              ->get()
              ->map(function ($request) {
                  if ($request->employee) {
                      $balance = $request->employee->getLeaveBalance();
                      $request->employee_balance = $balance;
                  } else {
                      $request->employee_balance = null;
                  }
                  return $request;
              });
          Log::info("✅ Demandes approuvées récupérées pour l'admin", ['count' => $requests->count(), 'requests_ids' => $requests->pluck('id')->toArray()]);

          return response()->json(['requests' => $requests]);

      } catch (\Exception $e) {
          Log::error('Erreur récupération demandes approuvées: ' . $e->getMessage());
          return response()->json([
              'message' => 'Erreur lors de la récupération des demandes approuvées',
              'error' => $e->getMessage()
          ], 500);
      }
  }

  public function generateCertificate(Request $request, $id)
  {
      Log::debug("✅ Début de la méthode generateCertificate pour la demande ID: {$id}");
      Log::info("DEBUG: generateCertificate method hit for ID: {$id}");
      try {
          Log::info("🔄 Génération de l'attestation pour la demande", ['request_id' => $id, 'user_id' => $request->user()->id]);

          $leaveRequest = LeaveRequest::with('employee')->findOrFail($id);

          // ✅ Vérifier que l'employé connecté est le propriétaire de la demande
          if ($leaveRequest->employee_id !== $request->user()->id) {
              Log::warning("❌ Accès non autorisé à l'attestation", [
                  'request_id' => $id,
                  'requested_employee_id' => $leaveRequest->employee_id,
                  'authenticated_user_id' => $request->user()->id
              ]);
              return response()->json([
                  'message' => 'Vous n\'êtes pas autorisé à télécharger cette attestation.'
              ], 403);
          }

          // Vérifier si la demande est approuvée
          if ($leaveRequest->status !== 'approved') {
              Log::warning("❌ Tentative de générer une attestation pour une demande non approuvée", ['request_id' => $id, 'status' => $leaveRequest->status]);
              return response()->json([
                  'message' => 'L\'attestation ne peut être générée que pour les demandes approuvées.'
              ], 400);
          }

          // Vérifier que l'employé existe
          if (!$leaveRequest->employee) {
              Log::error("❌ Employé non trouvé pour la demande", ['request_id' => $id]);
              return response()->json([
                  'message' => 'Employé associé à la demande introuvable.'
              ], 404);
          }

          $data = [
              'leaveRequest' => $leaveRequest,
              'employee' => $leaveRequest->employee,
          ];

          // Log de debug sans données personnelles
          Log::info("Génération du certificat PDF", [
              'request_id' => $data['leaveRequest']->id ?? 'N/A',
              'total_days' => $data['leaveRequest']->total_days ?? 'N/A',
          ]);

          $pdf = Pdf::loadView('certificates.leave_certificate', $data)
          ->setOptions(['isRemoteEnabled' => false]);

          Log::info("Certificat PDF généré avec succès", ['request_id' => $id]);

          return $pdf->download('attestation_conge_' . $leaveRequest->employee->full_name . '_' . $leaveRequest->id . '.pdf');

      } catch (\Exception $e) {
          Log::error('💥 Erreur lors de la génération de l\'attestation: ' . $e->getMessage(), [
              'file' => $e->getFile(),
              'line' => $e->getLine(),
              'trace' => $e->getTraceAsString()
          ]);
          return response()->json([
              'message' => 'Erreur lors de la génération de l\'attestation',
              'error' => $e->getMessage()
          ], 500);
      }
  }
}
