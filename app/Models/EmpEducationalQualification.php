<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpEducationalQualification extends Model
{
    protected $table = 'emp_educational_qualifications';

    protected $fillable = [
        'employee_id',
        'qualification',
        'passing_year',
        'institution_name',
        'board_university',
        'completion_date',
        'subject',
        'medium',
        'marks_percentage'
    ];

    protected $casts = [
        'passing_year' => 'integer',
        'completion_date' => 'date',
        'marks_percentage' => 'decimal:2'
    ];

    /**
     * Get the employee that owns the educational qualification.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
