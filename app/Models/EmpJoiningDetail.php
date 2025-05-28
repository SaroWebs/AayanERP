<?php

namespace App\Models;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;

class EmpJoiningDetail extends Model
{
    protected $guarded = [];

    public function emplyee()
    {
        return $this->belongsTo(Employee::class);
    }
}
