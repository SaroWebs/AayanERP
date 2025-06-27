<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'movable_id',
        'movable_type',
        'type',
        'quantity',
        'unit_price',
        'total_value',
        'from_location',
        'to_location',
        'reference_type',
        'reference_id',
        'reference_number',
        'movement_date',
        'reason',
        'notes',
        'created_by',
        'approved_by',
        'approved_at',
        'status',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'movement_date' => 'date',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the parent movable model (e.g., Item).
     */
    public function movable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that created the stock movement.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
} 