<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeChild extends Model
{
    protected $table = 'employee_children';

    protected $fillable = [
        'employee_id',
        'children_name',
        'children_dob',
        'children_gender',
        'qualification'
    ];

    protected $casts = [
        'children_dob' => 'date'
    ];

    /**
     * Get the employee that owns the child details.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
