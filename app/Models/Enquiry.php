<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Enquiry extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'enquiry_date' => 'date',
        'follow_up_date' => 'date',
        'converted_date' => 'date',
        'type' => 'string',
        'status' => 'string',
        'priority' => 'string',
        'source' => 'string',
    ];

    /**
     * Get the client that owns the enquiry.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class, 'client_detail_id');
    }

    /**
     * Get the contact person for the enquiry.
     */
    public function contactPerson(): BelongsTo
    {
        return $this->belongsTo(ClientContactDetail::class, 'contact_person_id');
    }

    /**
     * Get the user that created the enquiry.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user that is assigned to the enquiry.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the quotations for the enquiry.
     */
    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    /**
     * Scope a query to only include active enquiries.
     */
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['converted', 'lost', 'cancelled']);
    }

    /**
     * Scope a query to only include converted enquiries.
     */
    public function scopeConverted($query)
    {
        return $query->where('status', 'converted');
    }

    /**
     * Scope a query to only include pending follow-up enquiries.
     */
    public function scopePendingFollowUp($query)
    {
        return $query->where('status', 'pending_follow_up');
    }
}
