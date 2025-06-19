<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmpDocument extends Model
{
    protected $table = 'emp_documents';

    protected $fillable = [
        'employee_id',
        'category',
        'name',
        'number',
        'type',
        'remarks',
        'sharing_option',
        'issued_by',
        'issued_date',
        'document_url'
    ];

    protected $casts = [
        'issued_date' => 'date'
    ];

    /**
     * Get the employee that owns the document.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
