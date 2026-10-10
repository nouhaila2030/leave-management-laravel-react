<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\HolidayService;
use Carbon\Carbon;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'status',
        'admin_comment',
        'approved_by',
        'approved_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(Employee::class, 'approved_by');
    }

    /**
     * Calculer automatiquement les jours ouvrables
     */
    public function calculateWorkingDays()
    {
        if ($this->start_date && $this->end_date) {
            $startDate = Carbon::parse($this->start_date);
            $endDate = Carbon::parse($this->end_date);
            return HolidayService::calculateWorkingDays($startDate, $endDate);
        }
        return 0;
    }

    /**
     * Mettre à jour automatiquement total_days avant sauvegarde
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($leaveRequest) {
            $leaveRequest->total_days = $leaveRequest->calculateWorkingDays();
        });
    }
}
