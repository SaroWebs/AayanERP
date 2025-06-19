<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpJoiningDetail extends Model
{
    protected $table = 'emp_joining_details';

    protected $fillable = [
        'employee_id',
        'joining_date',
        'category',
        'appointment_type',
        'employee_id_number',
        'department',
        'designation',
        'reporting_to',
        'work_location',
        'photo_url',
        'probation_end_date',
        'contract_end_date',
        'joining_remarks'
    ];

    protected $casts = [
        'joining_date' => 'date',
        'probation_end_date' => 'date',
        'contract_end_date' => 'date'
    ];

    /**
     * Get the employee that owns the joining detail.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
