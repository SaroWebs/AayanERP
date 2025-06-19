<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeChild;
use Illuminate\Database\Seeder;

class EmployeeChildSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $childNames = [
            'Emma Johnson',
            'Noah Davis',
            'Olivia Brown',
            'Liam Wilson',
            'Sophia Miller',
            'Ethan Taylor',
            'Ava Anderson',
            'Mason Thomas'
        ];

        $qualifications = [
            'High School',
            'Primary School',
            'Pre-School',
            'College',
            'University'
        ];

        foreach ($employees as $employee) {
            // Create 1-3 children for each employee
            $numChildren = rand(1, 3);
            
            for ($i = 0; $i < $numChildren; $i++) {
                EmployeeChild::create([
                    'employee_id' => $employee->id,
                    'children_name' => $childNames[array_rand($childNames)],
                    'children_dob' => now()->subYears(rand(1, 15)),
                    'children_gender' => ['male', 'female'][rand(0, 1)],
                    'qualification' => $qualifications[array_rand($qualifications)]
                ]);
            }
        }
    }
} 