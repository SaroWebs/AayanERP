<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Quotation extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'approved_at' => 'datetime',
        'quotation_date' => 'date',
        'valid_until' => 'date',
        'sent_date' => 'date',
        'accepted_date' => 'date',
        'rejected_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'type' => 'string',
        'status' => 'string',
        'approval_status' => 'string',
    ];

    /**
     * Get the enquiry that owns the quotation.
     */
    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    /**
     * Get the client that owns the quotation.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class, 'client_detail_id');
    }

    /**
     * Get the contact person for the quotation.
     */
    public function contactPerson(): BelongsTo
    {
        return $this->belongsTo(ClientContactDetail::class, 'contact_person_id');
    }

    /**
     * Get the user that created the quotation.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that approved the quotation.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the items for the quotation.
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Get the sales orders for the quotation.
     */
    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class);
    }

    /**
     * Get the purchase orders for the quotation.
     */
    public function purchaseOrders()
    {
        return $this->belongsToMany(PurchaseOrder::class, 'purchase_order_quotation')
            ->withPivot(['created_by', 'remarks'])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include pending approval quotations.
     */
    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope a query to only include approved quotations.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope a query to only include active quotations.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('valid_until', '>=', now());
    }

    /**
     * Scope a query to only include accepted quotations.
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}
