<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeCurricularActivity extends Model
{
    protected $table = 'employee_curricular_activities';

    protected $guarded = [];

    protected $casts = [
        'event_year' => 'date'
    ];

    /**
     * Get the employee that owns the curricular activity.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
