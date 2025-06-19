<?php

namespace App\Models;

use App\Models\ClientDocument;
use App\Models\ClientBankAccount;
use App\Models\ClientContactDetail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientDetail extends Model
{
    protected $guarded = [];

    protected $fillable = [
        'name',
        'contact_no',
        'email',
        'gstin_no',
        'pan_no',
        'fax',
        'state',
        'address',
        'correspondence_address',
        'company_type',
        'turnover',
        'range',
        'status',
    ];

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
