<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpProfessionalQualification extends Model
{
    protected $table = 'emp_professional_qualifications';

    protected $fillable = [
        'employee_id',
        'exam_name',
        'institution',
        'division',
        'completion_year',
        'certificate_number',
        'valid_from',
        'valid_until',
        'remarks'
    ];

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
