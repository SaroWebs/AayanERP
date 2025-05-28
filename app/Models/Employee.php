<?php

namespace App\Models;

use App\Models\EmpAddress;
use App\Models\EmpDocument;
use Illuminate\Database\Eloquent\Model;
use App\Models\EmpEducationalQualification;

class Employee extends Model
{
    protected $guarded = [];

    public function addresses()
    {
        return $this->hasMany(EmpAddress::class);
    }
    
    public function documents()
    {
        return $this->hasMany(EmpDocument::class);
    }

    public function educational_qualifications()
    {
        return $this->hasMany(EmpEducationalQualification::class);
    }
    // 
}
