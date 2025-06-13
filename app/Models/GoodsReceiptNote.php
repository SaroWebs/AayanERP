<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceiptNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'approved_at' => 'datetime',
        'grn_date' => 'date',
        'received_date' => 'date',
        'inspection_date' => 'date',
        'return_date' => 'date',
        'challan_date' => 'date',
        'type' => 'string',
        'status' => 'string',
        'approval_status' => 'string',
        'quality_status' => 'string',
        'total_items' => 'integer',
        'received_items' => 'integer',
        'accepted_items' => 'integer',
        'rejected_items' => 'integer',
        'returned_items' => 'integer',
        'temperature_resistance_test' => 'json',
        'chemical_composition_test' => 'json',
        'physical_properties_test' => 'json',
        'dimensional_accuracy_test' => 'json',
        'visual_inspection_results' => 'json',
        'quality_certification_verification' => 'json',
        'batch_consistency_check' => 'json',
        'storage_condition_verification' => 'json',
        'test_temperature' => 'decimal:2',
        'test_pressure' => 'decimal:2',
        'test_duration' => 'integer',
        'test_environment' => 'string',
        'test_equipment_used' => 'string',
        'test_operator' => 'string',
        'test_remarks' => 'text',
    ];

    protected $fillable = [
        'temperature_resistance_test',
        'chemical_composition_test',
        'physical_properties_test',
        'dimensional_accuracy_test',
        'visual_inspection_results',
        'quality_certification_verification',
        'batch_consistency_check',
        'storage_condition_verification',
        'test_temperature',
        'test_pressure',
        'test_duration',
        'test_environment',
        'test_equipment_used',
        'test_operator',
        'test_remarks',
    ];

    /**
     * Get the purchase order that owns the GRN.
     */
    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    /**
     * Get the vendor that owns the GRN.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    /**
     * Get the user that created the GRN.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that approved the GRN.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user that received the goods.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Get the user that inspected the goods.
     */
    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    /**
     * Get the payments for the GRN.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(PurchasePayment::class);
    }

    /**
     * Scope a query to only include pending approval GRNs.
     */
    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope a query to only include approved GRNs.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope a query to only include pending inspection GRNs.
     */
    public function scopePendingInspection($query)
    {
        return $query->where('quality_status', 'pending');
    }

    /**
     * Scope a query to only include accepted GRNs.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * Scope a query to only include items that passed temperature resistance test.
     */
    public function scopePassedTemperatureTest($query)
    {
        return $query->whereJsonContains('temperature_resistance_test->passed', true);
    }

    /**
     * Scope a query to only include items that passed chemical composition test.
     */
    public function scopePassedChemicalTest($query)
    {
        return $query->whereJsonContains('chemical_composition_test->passed', true);
    }

    /**
     * Scope a query to only include items that passed physical properties test.
     */
    public function scopePassedPhysicalTest($query)
    {
        return $query->whereJsonContains('physical_properties_test->passed', true);
    }

    /**
     * Scope a query to only include items that passed dimensional accuracy test.
     */
    public function scopePassedDimensionalTest($query)
    {
        return $query->whereJsonContains('dimensional_accuracy_test->passed', true);
    }

    /**
     * Scope a query to only include items that passed visual inspection.
     */
    public function scopePassedVisualInspection($query)
    {
        return $query->whereJsonContains('visual_inspection_results->passed', true);
    }

    /**
     * Check if all quality tests have passed.
     */
    public function hasPassedAllQualityTests(): bool
    {
        return $this->passedTemperatureTest() &&
            $this->passedChemicalTest() &&
            $this->passedPhysicalTest() &&
            $this->passedDimensionalTest() &&
            $this->passedVisualInspection();
    }

    /**
     * Get failed quality tests.
     */
    public function getFailedQualityTests(): array
    {
        $failedTests = [];
        
        if (!$this->passedTemperatureTest()) {
            $failedTests[] = 'temperature_resistance';
        }
        if (!$this->passedChemicalTest()) {
            $failedTests[] = 'chemical_composition';
        }
        if (!$this->passedPhysicalTest()) {
            $failedTests[] = 'physical_properties';
        }
        if (!$this->passedDimensionalTest()) {
            $failedTests[] = 'dimensional_accuracy';
        }
        if (!$this->passedVisualInspection()) {
            $failedTests[] = 'visual_inspection';
        }

        return $failedTests;
    }
}
