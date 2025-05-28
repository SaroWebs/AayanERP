<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientContactDetail extends Model
{
    protected $guarded = [];

    public function clientDetail(): BelongsTo
    {
        return $this->belongsTo(ClientDetail::class);
    }
}
