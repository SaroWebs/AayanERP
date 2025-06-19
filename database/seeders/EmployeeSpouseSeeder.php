<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeSpouse;
use Illuminate\Database\Seeder;

class EmployeeSpouseSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $spouseNames = [
            'Sarah Johnson',
            'Emily Davis',
            'Michael Brown',
            'Lisa Wilson',
            'David Miller'
        ];

        $qualifications = [
            'Bachelor of Science',
            'Master of Business Administration',
            'Bachelor of Arts',
            'Master of Computer Applications',
            'Bachelor of Commerce'
        ];

        $jobDetails = [
            'Software Developer at Tech Corp',
            'HR Manager at Global Solutions',
            'Marketing Executive at Digital Media',
            'Financial Analyst at Investment Bank',
            'Project Manager at IT Services'
        ];

        foreach ($employees as $index => $employee) {
            EmployeeSpouse::create([
                'employee_id' => $employee->id,
                'spouse_name' => $spouseNames[$index % count($spouseNames)],
                'spouse_dob' => now()->subYears(rand(25, 35)),
                'spouse_telephone' => '98765' . str_pad($index, 5, '0', STR_PAD_LEFT),
                'spouse_qualification' => $qualifications[$index % count($qualifications)],
                'marriage_date' => now()->subYears(rand(1, 5)),
                'spouse_job_details' => $jobDetails[$index % count($jobDetails)],
                'mother_tongue' => ['hindi', 'english', 'bengali'][rand(0, 2)],
                'religion' => ['hindu', 'christian', 'muslim'][rand(0, 2)]
            ]);
        }
    }
} 