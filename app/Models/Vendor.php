<?php

namespace App\Models;

use App\Models\VendorDocument;
use App\Models\VendorBankAccount;
use App\Models\VendorContactDetail;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    protected $guarded = [];

    public function bank_accounts()
    {
        return $this->hasMany(VendorBankAccount::class, 'vendor_id');
    }

    public function contact_details()
    {
        return $this->hasMany(VendorContactDetail::class, 'vendor_id');
    }

    public function documents()
    {
        return $this->hasMany(VendorDocument::class, 'vendor_id');
    }
}
