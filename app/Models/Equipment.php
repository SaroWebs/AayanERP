<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'equipment_series_id',
        'details',
        'rental_rate',
        'make',
        'model',
        'serial_no',
        'code',
        'make_year',
        'capacity',
        'stock_unit',
        'unit_weight',
        'rental_unit',
        'status',
        'condition',
        'purchase_date',
        'purchase_price',
        'warranty_expiry',
        'last_maintenance_date',
        'next_maintenance_date',
        'location',
        'notes',
        'temperature_rating',
        'chemical_composition',
        'application_type',
        'technical_specifications',
        'material_safety_data',
        'installation_guidelines',
        'maintenance_requirements',
        'quality_certifications',
        'storage_conditions',
        'batch_number',
        'manufacturing_date',
        'expiry_date',
        'physical_properties',
        'dimensional_specifications',
        'visual_inspection_criteria',
    ];

    protected $casts = [
        'name' => 'string',
        'details' => 'string',
        'rental_rate' => 'decimal:2',
        'make' => 'string',
        'model' => 'string',
        'serial_no' => 'string',
        'code' => 'string',
        'make_year' => 'integer',
        'capacity' => 'string',
        'stock_unit' => 'string',
        'unit_weight' => 'string',
        'rental_unit' => 'string',
        'status' => 'string',
        'condition' => 'string',
        'purchase_date' => 'date',
        'purchase_price' => 'decimal:2',
        'warranty_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'location' => 'string',
        'notes' => 'string',
        'temperature_rating' => 'string',
        'chemical_composition' => 'json',
        'application_type' => 'string',
        'technical_specifications' => 'json',
        'material_safety_data' => 'json',
        'installation_guidelines' => 'string',
        'maintenance_requirements' => 'string',
        'quality_certifications' => 'json',
        'storage_conditions' => 'json',
        'batch_number' => 'string',
        'manufacturing_date' => 'date',
        'expiry_date' => 'date',
        'physical_properties' => 'json',
        'dimensional_specifications' => 'json',
        'visual_inspection_criteria' => 'json',
    ];

    /**
     * Get the category that owns the equipment.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the equipment series that owns the equipment.
     */
    public function equipmentSeries(): BelongsTo
    {
        return $this->belongsTo(EquipmentSeries::class);
    }
    
    public function series(): BelongsTo
    {
        return $this->belongsTo(EquipmentSeries::class);
    }

    /**
     * Scope a query to only include active equipment.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by condition.
     */
    public function scopeCondition($query, $condition)
    {
        return $query->where('condition', $condition);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to find equipment needing maintenance.
     */
    public function scopeNeedsMaintenance($query)
    {
        return $query->where('next_maintenance_date', '<=', now());
    }

    /**
     * Check if equipment is under warranty.
     */
    public function isUnderWarranty(): bool
    {
        return $this->warranty_expiry && $this->warranty_expiry->isFuture();
    }

    /**
     * Check if equipment needs maintenance.
     */
    public function needsMaintenance(): bool
    {
        return $this->next_maintenance_date && $this->next_maintenance_date->isPast();
    }

}
