<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmpAddress;
use Illuminate\Database\Seeder;

class EmployeeAddressSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create permanent address
            EmpAddress::create([
                'employee_id' => $employee->id,
                'type' => 'permanent',
                'care_of' => $employee->guardian_name,
                'house_number' => '123',
                'street' => 'Main Street',
                'landmark' => 'Near City Park',
                'police_station' => 'Central Police Station',
                'post_office' => 'Main Post Office',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pin_code' => '400001',
                'country' => 'India',
                'phone' => $employee->contact_no,
                'email' => $employee->email,
                'is_verified' => true
            ]);

            // Create residential address
            EmpAddress::create([
                'employee_id' => $employee->id,
                'type' => 'residential',
                'care_of' => $employee->first_name . ' ' . $employee->last_name,
                'house_number' => '456',
                'street' => 'Residential Street',
                'landmark' => 'Near Shopping Mall',
                'police_station' => 'Local Police Station',
                'post_office' => 'Local Post Office',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'pin_code' => '400002',
                'country' => 'India',
                'phone' => $employee->contact_no,
                'email' => $employee->email,
                'is_verified' => true
            ]);
        }
    }
} 