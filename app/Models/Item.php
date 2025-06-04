<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'status' => 'string',
        'unit' => 'string',
        'applicable_for' => 'string',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'reorder_point' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Scope a query to only include active items.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by applicable type.
     */
    public function scopeApplicableFor($query, $type)
    {
        return $query->where('applicable_for', $type);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Check if item needs reordering.
     */
    public function needsReorder(): bool
    {
        return $this->current_stock <= $this->reorder_point;
    }
}
