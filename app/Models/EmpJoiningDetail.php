<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpJoiningDetail extends Model
{
    protected $table = 'emp_joining_details';

    protected $guarded = [];

    protected $casts = [
        'joining_date' => 'date',
        'probation_end_date' => 'date',
        'contract_end_date' => 'date'
    ];

    /**
     * Get the employee that owns the joining detail.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
