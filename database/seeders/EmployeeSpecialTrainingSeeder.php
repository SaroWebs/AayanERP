<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeSpecialTraining;
use Illuminate\Database\Seeder;

class EmployeeSpecialTrainingSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $trainings = [
            [
                'name' => 'Advanced Project Management',
                'place' => 'Delhi',
                'organized_by' => 'Project Management Institute'
            ],
            [
                'name' => 'Leadership Development Program',
                'place' => 'Mumbai',
                'organized_by' => 'Indian Institute of Management'
            ],
            [
                'name' => 'Digital Marketing Certification',
                'place' => 'Bangalore',
                'organized_by' => 'Google Digital Academy'
            ],
            [
                'name' => 'Data Science Bootcamp',
                'place' => 'Hyderabad',
                'organized_by' => 'Indian Statistical Institute'
            ],
            [
                'name' => 'Agile Methodology Workshop',
                'place' => 'Chennai',
                'organized_by' => 'Scrum Alliance'
            ],
            [
                'name' => 'Cloud Computing Fundamentals',
                'place' => 'Pune',
                'organized_by' => 'AWS Training'
            ]
        ];

        foreach ($employees as $employee) {
            // Create 1-3 training records for each employee
            $numTrainings = rand(1, 3);
            $selectedTrainings = array_rand($trainings, $numTrainings);
            
            if (!is_array($selectedTrainings)) {
                $selectedTrainings = [$selectedTrainings];
            }

            foreach ($selectedTrainings as $index) {
                $training = $trainings[$index];
                $startDate = now()->subYears(rand(1, 3))->subMonths(rand(0, 11));
                $endDate = (clone $startDate)->addDays(rand(5, 30));

                EmployeeSpecialTraining::create([
                    'employee_id' => $employee->id,
                    'training_name' => $training['name'],
                    'training_place' => $training['place'],
                    'organized_by' => $training['organized_by'],
                    'training_start_date' => $startDate,
                    'training_end_date' => $endDate
                ]);
            }
        }
    }
} 