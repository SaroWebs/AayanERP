<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeNominee extends Model
{
    protected $table = 'employee_nominees';

    protected $guarded = [];

    protected $casts = [
        'nominee_dob' => 'date',
        'share_percentage' => 'integer'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
