<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EquipmentSeries extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get all equipment in this series.
     */
    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    /**
     * Scope a query to only include active series.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
