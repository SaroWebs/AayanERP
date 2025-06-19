<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmploymentDetail extends Model
{
    protected $table = 'employment_details';

    protected $fillable = [
        'employee_id',
        'organization',
        'position',
        'joining_date',
        'relieving_date',
        'salary',
        'relieving_reason'
    ];

    protected $casts = [
        'joining_date' => 'date',
        'relieving_date' => 'date',
        'salary' => 'integer'
    ];

    /**
     * Get the employee that owns the employment detail.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
