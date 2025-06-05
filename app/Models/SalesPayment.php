<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalesPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'approved_at' => 'datetime',
        'payment_date' => 'date',
        'received_date' => 'date',
        'bounce_date' => 'date',
        'cheque_date' => 'date',
        'amount' => 'decimal:2',
        'type' => 'string',
        'status' => 'string',
        'approval_status' => 'string',
        'payment_mode' => 'string',
    ];

    /**
     * Get the sales bill that owns the payment.
     */
    public function salesBill(): BelongsTo
    {
        return $this->belongsTo(SalesBill::class);
    }

    /**
     * Get the sales order that owns the payment.
     */
    public function salesOrder(): BelongsTo
    {
        return $this->belongsTo(SalesOrder::class);
    }

    /**
     * Get the client that owns the payment.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class, 'client_detail_id');
    }

    /**
     * Get the contact person for the payment.
     */
    public function contactPerson(): BelongsTo
    {
        return $this->belongsTo(ClientContactDetail::class, 'contact_person_id');
    }

    /**
     * Get the user that created the payment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that approved the payment.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user that received the payment.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    /**
     * Scope a query to only include pending approval payments.
     */
    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope a query to only include approved payments.
     */
    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    /**
     * Scope a query to only include received payments.
     */
    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    /**
     * Scope a query to only include bounced payments.
     */
    public function scopeBounced($query)
    {
        return $query->where('status', 'bounced');
    }
}
