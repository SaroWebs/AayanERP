<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAddress extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_verified' => 'boolean'
    ];

    /**
     * Get the employee that owns the address.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
} 