<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeKnownLanguage;
use Illuminate\Database\Seeder;

class EmployeeKnownLanguageSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $languages = [
            ['name' => 'English', 'priority' => 1],
            ['name' => 'Hindi', 'priority' => 2],
            ['name' => 'Bengali', 'priority' => 3],
            ['name' => 'Tamil', 'priority' => 4],
            ['name' => 'Telugu', 'priority' => 5],
            ['name' => 'Marathi', 'priority' => 6],
            ['name' => 'Gujarati', 'priority' => 7],
            ['name' => 'Kannada', 'priority' => 8],
            ['name' => 'Malayalam', 'priority' => 9],
            ['name' => 'Punjabi', 'priority' => 10]
        ];

        foreach ($employees as $employee) {
            // Each employee knows 2-4 languages
            $numLanguages = rand(2, 4);
            $selectedLanguages = array_rand($languages, $numLanguages);
            
            if (!is_array($selectedLanguages)) {
                $selectedLanguages = [$selectedLanguages];
            }

            foreach ($selectedLanguages as $index) {
                $language = $languages[$index];
                EmployeeKnownLanguage::create([
                    'employee_id' => $employee->id,
                    'language_name' => $language['name'],
                    'speak' => rand(0, 1),
                    'read' => rand(0, 1),
                    'write' => rand(0, 1),
                    'priority' => $language['priority']
                ]);
            }
        }
    }
} 