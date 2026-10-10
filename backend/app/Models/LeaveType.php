<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'max_days', // ✅ CORRECTION: utiliser 'max_days' au lieu de 'max_days_per_year'
        'requires_document',
        'is_active',
    ];

    protected $casts = [
        'requires_document' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relations
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
