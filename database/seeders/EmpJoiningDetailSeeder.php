<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmpJoiningDetail;
use Illuminate\Database\Seeder;

class EmpJoiningDetailSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $departments = ['IT', 'HR', 'Sales', 'Finance'];
        $designations = [
            'IT' => ['Software Engineer', 'Senior Developer', 'Tech Lead'],
            'HR' => ['HR Executive', 'HR Manager'],
            'Sales' => ['Sales Executive', 'Sales Manager'],
            'Finance' => ['Accountant', 'Finance Manager']
        ];

        foreach ($employees as $index => $employee) {
            $department = $departments[$index % count($departments)];
            $designation = $designations[$department][array_rand($designations[$department])];
            
            EmpJoiningDetail::create([
                'employee_id' => $employee->id,
                'joining_date' => now()->subYears(2),
                'category' => 'technical_staff',
                'appointment_type' => 'permanent',
                'employee_id_number' => 'EMP' . str_pad($employee->id, 4, '0', STR_PAD_LEFT),
                'department' => $department,
                'designation' => $designation,
                'reporting_to' => 'John Manager',
                'work_location' => 'Mumbai Office',
                'photo_url' => 'employees/photos/' . $employee->id . '.jpg',
                'probation_end_date' => now()->subYears(2)->addMonths(3),
                'contract_end_date' => null,
                'joining_remarks' => 'Joined as ' . $designation . ' in ' . $department . ' department'
            ]);
        }
    }
} 