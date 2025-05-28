<?php

namespace App\Models;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Model;

class VendorContactDetail extends Model
{
    protected $guarded = [];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
