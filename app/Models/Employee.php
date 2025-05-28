<?php

namespace App\Models;

use App\Models\EmpAddress;
use App\Models\EmpDocument;
use Illuminate\Database\Eloquent\Model;
use App\Models\EmpEducationalQualification;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $guarded = [];

    public function addresses(): HasMany
    {
        return $this->hasMany(EmpAddress::class);
    }
    
    public function documents(): HasMany
    {
        return $this->hasMany(EmpDocument::class);
    }

    public function educational_qualifications(): HasMany
    {
        return $this->hasMany(EmpEducationalQualification::class);
    }

    public function professional_qualifications(): HasMany
    {
        return $this->hasMany(EmpProfessionalQualification::class);
    }

    public function service_details(): HasMany
    {
        return $this->hasMany(EmpServiceDetail::class);
    }

    public function joining_details(): HasMany
    {
        return $this->hasMany(EmpJoiningDetail::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(EmployeeChild::class);
    }

    public function spouses(): HasMany
    {
        return $this->hasMany(EmployeeSpouse::class);
    }

    public function nominees(): HasMany
    {
        return $this->hasMany(EmployeeNominee::class);
    }

    public function references(): HasMany
    {
        return $this->hasMany(EmployeeRefference::class);
    }

    public function known_languages(): HasMany
    {
        return $this->hasMany(EmployeeKnownLanguage::class);
    }

    public function special_trainings(): HasMany
    {
        return $this->hasMany(EmployeeSpecialTraining::class);
    }

    public function curricular_activities(): HasMany
    {
        return $this->hasMany(EmployeeCurricularActivity::class);
    }
}
