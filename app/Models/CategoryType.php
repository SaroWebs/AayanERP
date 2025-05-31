<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoryType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'variant',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
        'variant' => 'string',
    ];

    /**
     * Get all categories for this category type.
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Scope a query to only include active category types.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by variant.
     */
    public function scopeVariant($query, $variant)
    {
        return $query->where('variant', $variant);
    }
}
