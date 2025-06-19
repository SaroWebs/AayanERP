<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAddress extends Model
{
    protected $fillable = [
        'employee_id',
        'type',
        'care_of',
        'house_number',
        'street',
        'landmark',
        'police_station',
        'post_office',
        'city',
        'state',
        'pin_code',
        'country',
        'phone',
        'email',
        'is_verified'
    ];

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