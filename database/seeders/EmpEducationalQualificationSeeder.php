<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmpEducationalQualification;
use Illuminate\Database\Seeder;

class EmpEducationalQualificationSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create HSSLC qualification
            EmpEducationalQualification::create([
                'employee_id' => $employee->id,
                'qualification' => 'hsslc',
                'passing_year' => 2010,
                'institution_name' => 'City High School',
                'board_university' => 'State Board',
                'completion_date' => '2010-05-15',
                'subject' => 'Science',
                'medium' => 'English',
                'marks_percentage' => 85.50
            ]);

            // Create Bachelor's degree
            EmpEducationalQualification::create([
                'employee_id' => $employee->id,
                'qualification' => 'bsc',
                'passing_year' => 2014,
                'institution_name' => 'State University',
                'board_university' => 'State University',
                'completion_date' => '2014-05-20',
                'subject' => 'Computer Science',
                'medium' => 'English',
                'marks_percentage' => 78.25
            ]);

            // Create Master's degree
            EmpEducationalQualification::create([
                'employee_id' => $employee->id,
                'qualification' => 'msc',
                'passing_year' => 2016,
                'institution_name' => 'National University',
                'board_university' => 'National University',
                'completion_date' => '2016-05-25',
                'subject' => 'Computer Science',
                'medium' => 'English',
                'marks_percentage' => 82.75
            ]);
        }
    }
}