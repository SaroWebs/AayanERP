<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpProfessionalQualification extends Model
{
    protected $table = 'emp_professional_qualifications';
    protected $guarded = [];

    protected $casts = [
        'completion_year' => 'integer',
        'valid_from' => 'date',
        'valid_until' => 'date'
    ];

    /**
     * Get the employee that owns the professional qualification.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
