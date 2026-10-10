<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Services\HolidayService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class Employee extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name', 
        'full_name',
        'email',
        'phone',
        'department',
        'position',
        'employee_id',
        'password',
        'role',
        'is_active',
        'hire_date',
        'cin',
        'address'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'hire_date' => 'date',
        'is_active' => 'boolean'
    ];

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function Requests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Calculer le solde de congés détaillé
     */
    public function getLeaveBalance($year = null)
    {
        try {
            $year = $year ?: date('Y');
            
            Log::info("🔍 Calcul solde congés", [
                'employee_id' => $this->id,
                'year' => $year
            ]);
            
            // Congés approuvés pour l'année
            $approvedRequests = $this->leaveRequests()
                ->where('status', 'approved')
                ->whereYear('start_date', $year)
                ->get();

            Log::info("📊 Demandes approuvées trouvées", [
                'count' => $approvedRequests->count(),
                'requests' => $approvedRequests->pluck('id')->toArray()
            ]);

            $usedDays = 0;
            foreach ($approvedRequests as $request) {
                $startDate = Carbon::parse($request->start_date);
                $endDate = Carbon::parse($request->end_date);
                $days = HolidayService::calculateWorkingDays($startDate, $endDate);
                $usedDays += $days;
                
                Log::info("📅 Calcul jours demande", [
                    'request_id' => $request->id,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                    'working_days' => $days
                ]);
            }

            $balance = [
                'totalDays' => 22,
                'usedDays' => $usedDays,
                'remainingDays' => max(0, 22 - $usedDays),
                'year' => $year
            ];

            Log::info("✅ Solde calculé", $balance);
            
            return $balance;
            
        } catch (\Exception $e) {
            Log::error("💥 Erreur calcul solde", [
                'employee_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Retourner un solde par défaut en cas d'erreur
            return [
                'totalDays' => 22,
                'usedDays' => 0,
                'remainingDays' => 22,
                'year' => $year ?: date('Y')
            ];
        }
    }

    /**
     * Vérifier si l'employé peut prendre des congés pour une période donnée
     */
    public function canTakeLeave($startDate, $endDate, $excludeRequestId = null)
    {
        try {
            $startDate = Carbon::parse($startDate);
            $endDate = Carbon::parse($endDate);
            
            Log::info("🔍 Vérification possibilité congé", [
                'employee_id' => $this->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'exclude_request_id' => $excludeRequestId
            ]);
            
            // Calculer les jours ouvrables demandés
            $requestedDays = HolidayService::calculateWorkingDays($startDate, $endDate);
            
            Log::info("📊 Jours demandés", ['requested_days' => $requestedDays]);
            
            // Vérifier le solde disponible
            $balance = $this->getLeaveBalance($startDate->year);
            
            if ($requestedDays > $balance['remainingDays']) {
                Log::warning("❌ Solde insuffisant", [
                    'requested_days' => $requestedDays,
                    'remaining_days' => $balance['remainingDays']
                ]);
                
                return [
                    'can_take' => false,
                    'reason' => "Solde insuffisant. Vous demandez {$requestedDays} jours mais il vous reste {$balance['remainingDays']} jours.",
                    'requested_days' => $requestedDays,
                    'remaining_days' => $balance['remainingDays']
                ];
            }

            // Vérifier les chevauchements avec les demandes approuvées
            $overlappingQuery = $this->leaveRequests()
                ->where('status', 'approved')
                ->where(function($query) use ($startDate, $endDate) {
                    $query->whereBetween('start_date', [$startDate, $endDate])
                          ->orWhereBetween('end_date', [$startDate, $endDate])
                          ->orWhere(function($q) use ($startDate, $endDate) {
                              $q->where('start_date', '<=', $startDate)
                                ->where('end_date', '>=', $endDate);
                          });
                });

            if ($excludeRequestId) {
                $overlappingQuery->where('id', '!=', $excludeRequestId);
            }

            $overlappingRequests = $overlappingQuery->get();
            
            Log::info("🔍 Vérification chevauchements", [
                'overlapping_count' => $overlappingRequests->count()
            ]);

            if ($overlappingRequests->count() > 0) {
                $overlapping = $overlappingRequests->first();
                Log::warning("❌ Chevauchement détecté", [
                    'overlapping_request_id' => $overlapping->id,
                    'overlapping_start' => $overlapping->start_date,
                    'overlapping_end' => $overlapping->end_date
                ]);
                
                return [
                    'can_take' => false,
                    'reason' => "Cette période chevauche avec une demande déjà approuvée du " . 
                               Carbon::parse($overlapping->start_date)->format('d/m/Y') . 
                               " au " . Carbon::parse($overlapping->end_date)->format('d/m/Y'),
                    'requested_days' => $requestedDays,
                    'remaining_days' => $balance['remainingDays']
                ];
            }

            Log::info("✅ Congé autorisé", [
                'requested_days' => $requestedDays,
                'remaining_after' => $balance['remainingDays'] - $requestedDays
            ]);

            return [
                'can_take' => true,
                'requested_days' => $requestedDays,
                'remaining_days' => $balance['remainingDays'] - $requestedDays
            ];
            
        } catch (\Exception $e) {
            Log::error("💥 Erreur vérification congé", [
                'employee_id' => $this->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'can_take' => false,
                'reason' => "Erreur lors de la vérification: " . $e->getMessage(),
                'requested_days' => 0,
                'remaining_days' => 0
            ];
        }
    }
}
