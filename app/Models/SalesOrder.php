<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesOrder extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'approved_at' => 'datetime',
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'acknowledgement_date' => 'date',
        'sent_date' => 'date',
        'cancellation_date' => 'date',
        'closing_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'type' => 'string',
        'status' => 'string',
        'approval_status' => 'string',
    ];

    /**
     * Get the quotation that owns the sales order.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Get the client that owns the sales order.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class, 'client_detail_id');
    }

    /**
     * Get the contact person for the sales order.
     */
    public function contactPerson(): BelongsTo
    {
        return $this->belongsTo(ClientContactDetail::class, 'contact_person_id');
    }

    /**
     * Get the user that created the sales order.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that approved the sales order.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the dispatches for the sales order.
     */
    public function dispatches(): HasMany
    {
        return $this->hasMany(Dispatch::class);
    }

    /**
     * Get the bills for the sales order.
     */
    public function bills(): HasMany
    {
        return $this->hasMany(SalesBill::class);
    }

    /**
     * Get the payments for the sales order.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(SalesPayment::class);
    }

    /**
     * Scope a query to only include pending approval orders.
     */
    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope a query to only include approved orders.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope a query to only include active orders.
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['cancelled', 'closed']);
    }

    /**
     * Scope a query to only include orders pending dispatch.
     */
    public function scopePendingDispatch($query)
    {
        return $query->where('status', 'pending_dispatch');
    }
}
