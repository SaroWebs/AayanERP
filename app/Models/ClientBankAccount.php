<?php

namespace App\Models;

use App\Models\ClientDetail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientBankAccount extends Model
{
    protected $guarded = [];

    public function clientDetail(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class);
    }
}
