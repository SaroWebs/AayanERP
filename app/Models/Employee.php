<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'pf_no',
        'date_of_birth',
        'gender',
        'blood_group',
        'pan_no',
        'aadhar_no',
        'guardian_name',
        'contact_no',
        'email',
        'country'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'contact_no' => 'integer'
    ];

    /**
     * Get the employee's addresses.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(EmpAddress::class);
    }

    /**
     * Get the employee's documents.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(EmpDocument::class);
    }

    /**
     * Get the employee's educational qualifications.
     */
    public function educationalQualifications(): HasMany
    {
        return $this->hasMany(EmpEducationalQualification::class);
    }

    /**
     * Get the employee's professional qualifications.
     */
    public function professionalQualifications(): HasMany
    {
        return $this->hasMany(EmpProfessionalQualification::class);
    }

    /**
     * Get the employee's service details.
     */
    public function serviceDetails(): HasMany
    {
        return $this->hasMany(EmploymentDetail::class);
    }

    /**
     * Get the employee's joining details.
     */
    public function joiningDetails(): HasMany
    {
        return $this->hasMany(EmpJoiningDetail::class);
    }

    /**
     * Get the employee's spouse details.
     */
    public function spouse(): HasMany
    {
        return $this->hasMany(EmployeeSpouse::class);
    }

    /**
     * Get the employee's children.
     */
    public function children(): HasMany
    {
        return $this->hasMany(EmployeeChild::class);
    }

    /**
     * Get the employee's curricular activities.
     */
    public function curricularActivities(): HasMany
    {
        return $this->hasMany(EmployeeCurricularActivity::class);
    }

    /**
     * Get the employee's known languages.
     */
    public function knownLanguages(): HasMany
    {
        return $this->hasMany(EmployeeKnownLanguage::class);
    }

    /**
     * Get the employee's special trainings.
     */
    public function specialTrainings(): HasMany
    {
        return $this->hasMany(EmployeeSpecialTraining::class);
    }

    /**
     * Get the employee's nominees.
     */
    public function nominees(): HasMany
    {
        return $this->hasMany(EmployeeNominee::class);
    }

    /**
     * Get the employee's references.
     */
    public function references(): HasMany
    {
        return $this->hasMany(EmployeeRefference::class);
    }
}
