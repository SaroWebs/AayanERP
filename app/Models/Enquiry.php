<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Enquiry extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'enquiry_date' => 'date',
        'required_date' => 'date',
        'valid_until' => 'date',
        'converted_date' => 'date',
        'next_follow_up_date' => 'date',
        'approved_at' => 'datetime',
        'estimated_value' => 'decimal:2',
        'status' => 'string',
        'priority' => 'string',
        'source' => 'string',
        'approval_status' => 'string',
        'currency' => 'string'
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
     * Get the items for the enquiry.
     */
    public function items(): HasMany
    {
        return $this->hasMany(EnquiryItem::class);
    }

    /**
     * Get the employee that referred the enquiry.
     */
    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'referred_by');
    }

    /**
     * Get the user that approved the enquiry.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
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
     * Scope a query to only include enquiries requiring approval.
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('approval_status', 'pending');
    }

    /**
     * Scope a query to only include enquiries by status.
     */
    public function scopeByStatus(Builder $query, string|array $status): Builder
    {
        return $query->whereIn('status', (array) $status);
    }

    /**
     * Scope a query to only include enquiries by priority.
     */
    public function scopeByPriority(Builder $query, string|array $priority): Builder
    {
        return $query->whereIn('priority', (array) $priority);
    }

    /**
     * Scope a query to only include enquiries by source.
     */
    public function scopeBySource(Builder $query, string|array $source): Builder
    {
        return $query->whereIn('source', (array) $source);
    }

    /**
     * Scope a query to only include enquiries created by a user.
     */
    public function scopeCreatedBy(Builder $query, int $userId): Builder
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Scope a query to only include enquiries for a client.
     */
    public function scopeForClient(Builder $query, int $clientId): Builder
    {
        return $query->where('client_detail_id', $clientId);
    }

    /**
     * Scope a query to only include enquiries within a date range.
     */
    public function scopeDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('enquiry_date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include enquiries assigned to a user.
     */
    public function scopeAssignedTo(Builder $query, int $userId): Builder
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Check if the enquiry can be edited.
     */
    public function canBeEdited(): bool
    {
        return !in_array($this->status, ['converted', 'lost', 'cancelled']);
    }

    /**
     * Check if the enquiry can be deleted.
     */
    public function canBeDeleted(): bool
    {
        return !in_array($this->status, ['converted', 'lost', 'cancelled']);
    }

    /**
     * Check if the enquiry requires approval.
     */
    public function requiresApproval(): bool
    {
        return $this->approval_status === 'pending';
    }

    /**
     * Check if the enquiry is approved.
     */
    public function isApproved(): bool
    {
        return $this->approval_status === 'approved';
    }

    /**
     * Check if the enquiry is converted.
     */
    public function isConverted(): bool
    {
        return $this->status === 'converted';
    }

    /**
     * Get the formatted estimated value with currency.
     */
    public function getFormattedEstimatedValueAttribute(): string
    {
        if (!$this->estimated_value) return '-';
        return $this->currency . ' ' . number_format($this->estimated_value, 2);
    }

    /**
     * Get the formatted status with color.
     */
    public function getStatusWithColorAttribute(): array
    {
        return match($this->status) {
            'draft' => ['label' => 'Draft', 'color' => 'gray'],
            'pending_review' => ['label' => 'Pending Review', 'color' => 'yellow'],
            'under_review' => ['label' => 'Under Review', 'color' => 'orange'],
            'quoted' => ['label' => 'Quoted', 'color' => 'purple'],
            'pending_approval' => ['label' => 'Pending Approval', 'color' => 'blue'],
            'approved' => ['label' => 'Approved', 'color' => 'cyan'],
            'converted' => ['label' => 'Converted', 'color' => 'green'],
            'lost' => ['label' => 'Lost', 'color' => 'red'],
            'cancelled' => ['label' => 'Cancelled', 'color' => 'gray'],
            default => ['label' => ucfirst(str_replace('_', ' ', $this->status)), 'color' => 'gray']
        };
    }

    /**
     * Get the formatted priority with color.
     */
    public function getPriorityWithColorAttribute(): array
    {
        return match($this->priority) {
            'low' => ['label' => 'Low', 'color' => 'green'],
            'medium' => ['label' => 'Medium', 'color' => 'yellow'],
            'high' => ['label' => 'High', 'color' => 'orange'],
            'urgent' => ['label' => 'Urgent', 'color' => 'red'],
            default => ['label' => ucfirst($this->priority), 'color' => 'gray']
        };
    }

    /**
     * Get the formatted source with color.
     */
    public function getSourceWithColorAttribute(): array
    {
        return match($this->source) {
            'website' => ['label' => 'Website', 'color' => 'blue'],
            'email' => ['label' => 'Email', 'color' => 'cyan'],
            'phone' => ['label' => 'Phone', 'color' => 'green'],
            'referral' => ['label' => 'Referral', 'color' => 'purple'],
            'walk_in' => ['label' => 'Walk In', 'color' => 'orange'],
            'other' => ['label' => 'Other', 'color' => 'gray'],
            default => ['label' => ucfirst($this->source), 'color' => 'gray']
        };
    }

    /**
     * Get the formatted approval status with color.
     */
    public function getApprovalStatusWithColorAttribute(): array
    {
        return match($this->approval_status) {
            'pending' => ['label' => 'Pending', 'color' => 'yellow'],
            'approved' => ['label' => 'Approved', 'color' => 'green'],
            'rejected' => ['label' => 'Rejected', 'color' => 'red'],
            'not_required' => ['label' => 'Not Required', 'color' => 'gray'],
            default => ['label' => ucfirst($this->approval_status), 'color' => 'gray']
        };
    }

    /**
     * Get the next follow-up date in a human-readable format.
     */
    public function getNextFollowUpDateFormattedAttribute(): string
    {
        if (!$this->next_follow_up_date) return '-';
        return $this->next_follow_up_date->format('M d, Y');
    }

    /**
     * Get the enquiry date in a human-readable format.
     */
    public function getEnquiryDateFormattedAttribute(): string
    {
        if (!$this->enquiry_date) return '-';
        return $this->enquiry_date->format('M d, Y');
    }

    /**
     * Get the required date in a human-readable format.
     */
    public function getRequiredDateFormattedAttribute(): string
    {
        if (!$this->required_date) return '-';
        return $this->required_date->format('M d, Y');
    }

    /**
     * Get the valid until date in a human-readable format.
     */
    public function getValidUntilFormattedAttribute(): string
    {
        if (!$this->valid_until) return '-';
        return $this->valid_until->format('M d, Y');
    }

    /**
     * Get the converted date in a human-readable format.
     */
    public function getConvertedDateFormattedAttribute(): string
    {
        if (!$this->converted_date) return '-';
        return $this->converted_date->format('M d, Y');
    }

    /**
     * Get the approved at date in a human-readable format.
     */
    public function getApprovedAtFormattedAttribute(): string
    {
        if (!$this->approved_at) return '-';
        return $this->approved_at->format('M d, Y H:i');
    }
}
