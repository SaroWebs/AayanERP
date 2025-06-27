<?php

namespace App\Models;

use App\Models\Item;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EnquiryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'quantity' => 'integer',
        'estimated_value' => 'decimal:2',
    ];

    /**
     * Get the enquiry that owns the item.
     */
    public function enquiry(): BelongsTo
    {
        return $this->belongsTo(Enquiry::class);
    }

    /**
     * Get the equipment for this item.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
} 