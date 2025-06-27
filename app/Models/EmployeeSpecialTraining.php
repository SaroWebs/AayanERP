<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSpecialTraining extends Model
{
    protected $table = 'employee_special_trainings';
    protected $guarded = [];

    protected $casts = [
        'training_start_date' => 'date',
        'training_end_date' => 'date'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
