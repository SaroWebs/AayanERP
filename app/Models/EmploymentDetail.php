<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploymentDetail extends Model
{
    protected $guarded = [];

    public function emplyee()
    {
        return $this->belongsTo(Employee::class);
    }
}
