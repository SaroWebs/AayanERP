<?php

namespace App\Models;

use App\Models\VendorDocument;
use App\Models\VendorBankAccount;
use App\Models\VendorContactDetail;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $guarded = [];

    /**
     * Get the bank accounts for the vendor.
     */
    public function bankAccounts()
    {
        return $this->hasMany(VendorBankAccount::class);
    }
    
    /**
     * Get the contact details for the vendor.
     */
    public function contactDetails()
    {
        return $this->hasMany(VendorContactDetail::class);
    }
    
    /**
     * Get the documents for the vendor.
     */
    public function documents()
    {
        return $this->hasMany(VendorDocument::class);
    }
    
}
