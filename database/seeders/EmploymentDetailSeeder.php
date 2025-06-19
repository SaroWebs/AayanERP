<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmploymentDetail;
use Illuminate\Database\Seeder;

class EmploymentDetailSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create current employment
            EmploymentDetail::create([
                'employee_id' => $employee->id,
                'organization' => 'Aayan Technologies',
                'position' => 'Senior Software Engineer',
                'joining_date' => now()->subYears(2),
                'relieving_date' => null,
                'salary' => 75000,
                'relieving_reason' => null
            ]);

            // Create previous employment
            EmploymentDetail::create([
                'employee_id' => $employee->id,
                'organization' => 'Tech Solutions Inc.',
                'position' => 'Software Engineer',
                'joining_date' => now()->subYears(4),
                'relieving_date' => now()->subYears(2),
                'salary' => 50000,
                'relieving_reason' => 'Better career opportunity'
            ]);

            // Create first employment
            EmploymentDetail::create([
                'employee_id' => $employee->id,
                'organization' => 'StartUp Innovations',
                'position' => 'Junior Developer',
                'joining_date' => now()->subYears(6),
                'relieving_date' => now()->subYears(4),
                'salary' => 30000,
                'relieving_reason' => 'Career growth'
            ]);
        }
    }
} 