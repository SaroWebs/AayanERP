<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSpouse extends Model
{
    protected $table = 'employee_spouses';

    protected $guarded = [];

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
