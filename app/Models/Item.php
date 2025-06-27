<?php

namespace App\Models;

use App\Models\Category;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $fillable = [
        'code',
        'name',
        'slug',
        'category_id',
        'hsn',
        'description',
        'make',
        'model_no',
        'max_capacity',
        'readability',
        'plateform_size',
        'plateform_moc',
        'indicator_moc',
        'load_plate',
        'indicator_mounding',
        'quality',
        'type',
        'unit',
        'status',
        'minimum_stock',
        'current_stock',
        'maximum_stock',
        'reorder_point',
        'reorder_quantity',
        'standard_cost',
        'selling_price',
        'rental_rate',
        'specifications',
        'technical_details',
        'safety_data',
        'storage_location',
        'storage_conditions',
        'storage_instructions',
        'manufacturer',
        'supplier',
        'warranty_period',
        'last_purchase_date',
        'last_purchase_price',
        'sort_order'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'minimum_stock' => 'decimal:2',
        'current_stock' => 'decimal:2',
        'maximum_stock' => 'decimal:2',
        'reorder_point' => 'decimal:2',
        'reorder_quantity' => 'decimal:2',
        'standard_cost' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'rental_rate' => 'decimal:2',
        'specifications' => 'array',
        'technical_details' => 'array',
        'safety_data' => 'array',
        'last_purchase_date' => 'date',
        'last_purchase_price' => 'decimal:2',
        'sort_order' => 'integer',
        'status' => 'string',
        'type' => 'string',
        'unit' => 'string',
    ];

    public static $rules = [
        'code' => 'required|string|max:50|unique:items,code',
        'name' => 'required|string|max:255|unique:items,name',
        'slug' => 'nullable|string|max:255|unique:items,slug',
        'category_id' => 'nullable|exists:categories,id',
        'hsn' => 'nullable|string|max:50',
        'description' => 'nullable|string',
        'make' => 'nullable|string|max:255',
        'model_no' => 'nullable|string|max:255',
        'max_capacity' => 'nullable|string|max:255',
        'readability' => 'nullable|string|max:255',
        'plateform_size' => 'nullable|string|max:255',
        'plateform_moc' => 'nullable|string|max:255',
        'indicator_moc' => 'nullable|string|max:255',
        'load_plate' => 'nullable|string|max:255',
        'indicator_mounding' => 'nullable|string|max:255',
        'quality' => 'nullable|string|max:255',
        'type' => 'required|in:consumable,spare_part,tool,material,other',
        'unit' => 'nullable|in:set,nos,rmt,sqm,ltr,kg,ton,box,pack,pcs,na',
        'status' => 'required|in:active,inactive,discontinued',
        'minimum_stock' => 'nullable|numeric|min:0',
        'current_stock' => 'nullable|numeric|min:0',
        'maximum_stock' => 'nullable|numeric|min:0',
        'reorder_point' => 'nullable|numeric|min:0',
        'reorder_quantity' => 'nullable|numeric|min:0',
        'standard_cost' => 'nullable|numeric|min:0',
        'selling_price' => 'nullable|numeric|min:0',
        'rental_rate' => 'nullable|numeric|min:0',
        'specifications' => 'nullable|array',
        'technical_details' => 'nullable|array',
        'safety_data' => 'nullable|array',
        'storage_location' => 'nullable|string|max:255',
        'storage_conditions' => 'nullable|string|max:255',
        'storage_instructions' => 'nullable|string',
        'manufacturer' => 'nullable|string|max:255',
        'supplier' => 'nullable|string|max:255',
        'warranty_period' => 'nullable|string|max:255',
        'last_purchase_date' => 'nullable|date',
        'last_purchase_price' => 'nullable|numeric|min:0',
        'sort_order' => 'nullable|integer|min:0',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }


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
