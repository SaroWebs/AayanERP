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
}
