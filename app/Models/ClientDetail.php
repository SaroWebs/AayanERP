<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientDetail extends Model
{
    protected $guarded = [];

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(ClientBankAccount::class);
    }

    public function contactDetails(): HasMany
    {
        return $this->hasMany(ClientContactDetail::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ClientDocument::class);
    }
}
