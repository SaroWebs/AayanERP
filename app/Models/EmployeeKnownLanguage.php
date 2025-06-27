<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeKnownLanguage extends Model
{
    protected $table = 'employee_known_languages';

    protected $guarded = [];

    protected $casts = [
        'speak' => 'boolean',
        'read' => 'boolean',
        'write' => 'boolean',
        'priority' => 'integer'
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
