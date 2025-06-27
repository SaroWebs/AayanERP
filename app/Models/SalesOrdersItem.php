<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalesOrdersItem extends Model
{
    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
