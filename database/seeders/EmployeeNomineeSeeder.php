<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeNominee;
use Illuminate\Database\Seeder;

class EmployeeNomineeSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $relationships = [
            'father',
            'mother',
            'brother',
            'sister',
            'son',
            'daughter',
            'husband',
            'wife',
            'other'
        ];

        $firstNames = [
            'Rajesh', 'Priya', 'Amit', 'Neha', 'Suresh', 'Anita',
            'Vikram', 'Meera', 'Rahul', 'Pooja', 'Arun', 'Deepa',
            'Sanjay', 'Kavita', 'Manoj', 'Ritu', 'Vijay', 'Smita'
        ];

        $lastNames = [
            'Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Verma',
            'Yadav', 'Chauhan', 'Mishra', 'Reddy', 'Nair', 'Iyer',
            'Mehta', 'Joshi', 'Malhotra', 'Chopra', 'Kapoor', 'Saxena'
        ];

        foreach ($employees as $employee) {
            // Create 1-2 nominees for each employee
            $numNominees = rand(1, 2);
            $totalPercentage = 0;

            for ($i = 0; $i < $numNominees; $i++) {
                $relationship = $relationships[array_rand($relationships)];
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                
                // Calculate share percentage
                $remainingPercentage = 100 - $totalPercentage;
                $sharePercentage = $i === $numNominees - 1 ? $remainingPercentage : rand(20, min(60, $remainingPercentage));
                $totalPercentage += $sharePercentage;

                // Generate a realistic date of birth based on relationship
                $dob = match($relationship) {
                    'father', 'mother' => now()->subYears(rand(50, 70)),
                    'brother', 'sister' => now()->subYears(rand(20, 50)),
                    'son', 'daughter' => now()->subYears(rand(5, 25)),
                    'husband', 'wife' => now()->subYears(rand(25, 45)),
                    default => now()->subYears(rand(20, 60))
                };

                EmployeeNominee::create([
                    'employee_id' => $employee->id,
                    'nominee_name' => $firstName . ' ' . $lastName,
                    'nominee_relationship' => $relationship,
                    'nominee_dob' => $dob,
                    'share_percentage' => $sharePercentage
                ]);
            }
        }
    }
} 