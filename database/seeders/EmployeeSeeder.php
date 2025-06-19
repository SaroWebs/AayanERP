<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'pf_no' => 'PF001',
                'date_of_birth' => '1990-01-15',
                'gender' => 'male',
                'blood_group' => 'O+',
                'pan_no' => 'ABCDE1234F',
                'aadhar_no' => '123456789012',
                'guardian_name' => 'James Doe',
                'contact_no' => '9876543210',
                'email' => 'john.doe@aayan.com',
                'country' => 'India'
            ],
            [
                'first_name' => 'Jane',
                'last_name' => 'Smith',
                'pf_no' => 'PF002',
                'date_of_birth' => '1992-05-20',
                'gender' => 'female',
                'blood_group' => 'A+',
                'pan_no' => 'FGHIJ5678K',
                'aadhar_no' => '987654321098',
                'guardian_name' => 'Mary Smith',
                'contact_no' => '9876543211',
                'email' => 'jane.smith@aayan.com',
                'country' => 'India'
            ],
            [
                'first_name' => 'Robert',
                'last_name' => 'Johnson',
                'pf_no' => 'PF003',
                'date_of_birth' => '1988-11-30',
                'gender' => 'male',
                'blood_group' => 'B+',
                'pan_no' => 'LMNOP9012Q',
                'aadhar_no' => '456789012345',
                'guardian_name' => 'William Johnson',
                'contact_no' => '9876543212',
                'email' => 'robert.johnson@aayan.com',
                'country' => 'India'
            ]
        ];

        foreach ($employees as $employee) {
            Employee::firstOrCreate(
                ['pf_no' => $employee['pf_no']],
                $employee
            );
        }
    }
} 