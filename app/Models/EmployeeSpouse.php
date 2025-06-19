<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSpouse extends Model
{
    protected $table = 'employee_spouses';

    protected $fillable = [
        'employee_id',
        'spouse_name',
        'spouse_dob',
        'spouse_telephone',
        'spouse_qualification',
        'marriage_date',
        'spouse_job_details',
        'mother_tongue',
        'religion'
    ];

    protected $casts = [
        'spouse_dob' => 'date',
        'marriage_date' => 'date'
    ];

    /**
     * Get the employee that owns the spouse details.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
