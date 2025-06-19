<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeReference extends Model
{
    protected $table = 'employee_refferences';

    protected $fillable = [
        'employee_id',
        'reference_name',
        'designation',
        'reference_address'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
} 