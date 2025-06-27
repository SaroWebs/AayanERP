<?php

namespace App\Models;

use App\Models\Item;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'status' => 'string',
        'sort_order' => 'integer',
        'technical_requirements' => 'json',
        'application_areas' => 'json',
        'quality_standards' => 'json',
    ];

    // Constants for main refractory categories
    const BASIC_BRICKS = 'basic_bricks';
    const DENSE_FIRE_BRICKS = 'dense_fire_bricks';
    const HIGH_ALUMINA_BRICKS = 'high_alumina_bricks';
    const SPECIAL_QUALITY_BRICKS = 'special_quality_bricks';
    const CASTABLES_MORTARS = 'castables_mortars';
    const INSULATION_PRODUCTS = 'insulation_products';
    const FLOW_CONTROL_PRODUCTS = 'flow_control_products';
    const CERAMIC_PRODUCTS = 'ceramic_products';

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Get all equipment for this category.
     */
    public function items(): HasMany
    {
        return $this->hasMany(Item::class);
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    /**
     * Get all root categories (categories without parents).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get all available refractory categories.
     */
    public static function getRefractoryCategories(): array
    {
        return [
            self::BASIC_BRICKS,
            self::DENSE_FIRE_BRICKS,
            self::HIGH_ALUMINA_BRICKS,
            self::SPECIAL_QUALITY_BRICKS,
            self::CASTABLES_MORTARS,
            self::INSULATION_PRODUCTS,
            self::FLOW_CONTROL_PRODUCTS,
            self::CERAMIC_PRODUCTS,
        ];
    }

    /**
     * Check if category is a root category.
     */
    public function isRoot(): bool
    {
        return is_null($this->parent_id);
    }

    /**
     * Check if category has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    /**
     * Get all ancestors of the category.
     */
    public function getAncestors()
    {
        $ancestors = collect();
        $category = $this;

        while ($category->parent) {
            $ancestors->push($category->parent);
            $category = $category->parent;
        }

        return $ancestors->reverse();
    }

    /**
     * Get all descendants of the category.
     */
    public function getDescendants()
    {
        $descendants = collect();

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->getDescendants());
        }

        return $descendants;
    }
}
