<?php

namespace App\Models;

use App\Models\VendorDocument;
use App\Models\VendorBankAccount;
use App\Models\VendorContactDetail;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $guarded = [];

    public function bankAccounts()
    {
        return $this->hasMany(VendorBankAccount::class);
    }
    
    public function contactDetails()
    {
        return $this->hasMany(VendorContactDetail::class);
    }
    
    public function documents()
    {
        return $this->hasMany(VendorDocument::class);
    }
    
}
