<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

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
        'current_stock' => 'integer',
    ];

    /**
     * Validation rules for the model.
     */
    public static $rules = [
        'name' => 'required|string|max:255',
        'code' => 'required|string|max:50|unique:items',
        'description_1' => 'nullable|string',
        'description_2' => 'nullable|string',
        'applicable_for' => 'required|in:all,equipment,scaffolding',
        'hsn' => 'nullable|string|max:50',
        'unit' => 'nullable|in:set,nos,rmt,sqm,ltr,na',
        'minimum_stock' => 'required|integer|min:0',
        'current_stock' => 'required|integer|min:0',
        'maximum_stock' => 'nullable|integer|min:0|gt:minimum_stock',
        'reorder_point' => 'nullable|integer|min:0',
        'sort_order' => 'integer|min:0',
        'status' => 'required|in:active,inactive',
    ];

    /**
     * Get the stock movements for the item.
     */
    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'movable');
    }

    /**
     * Get the last stock movement for the item.
     */
    public function lastStockMovement()
    {
        return $this->stockMovements()->latest()->first();
    }

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
     * Scope a query to filter items that need reordering.
     */
    public function scopeNeedsReorder($query)
    {
        return $query->whereRaw('current_stock <= reorder_point');
    }

    /**
     * Scope a query to filter items with low stock.
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('current_stock <= minimum_stock');
    }

    /**
     * Check if item needs reordering.
     */
    public function needsReorder(): bool
    {
        return $this->current_stock <= $this->reorder_point;
    }

    /**
     * Check if item has low stock.
     */
    public function hasLowStock(): bool
    {
        return $this->current_stock <= $this->minimum_stock;
    }

    /**
     * Check if item has excess stock.
     */
    public function hasExcessStock(): bool
    {
        return $this->maximum_stock !== null && $this->current_stock > $this->maximum_stock;
    }

    /**
     * Get the stock level status.
     */
    public function getStockLevelStatus(): string
    {
        if ($this->hasLowStock()) {
            return 'low';
        }
        if ($this->hasExcessStock()) {
            return 'excess';
        }
        return 'normal';
    }

    /**
     * Add stock to the item.
     */
    public function addStock(int $quantity): bool
    {
        if ($quantity <= 0) {
            return false;
        }

        $this->current_stock += $quantity;
        return $this->save();
    }

    /**
     * Remove stock from the item.
     */
    public function removeStock(int $quantity): bool
    {
        if ($quantity <= 0 || $this->current_stock < $quantity) {
            return false;
        }

        $this->current_stock -= $quantity;
        return $this->save();
    }

    /**
     * Set the current stock level.
     */
    public function setStock(int $quantity): bool
    {
        if ($quantity < 0) {
            return false;
        }

        $this->current_stock = $quantity;
        return $this->save();
    }
}
