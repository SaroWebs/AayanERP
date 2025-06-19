<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeCurricularActivity;
use Illuminate\Database\Seeder;

class EmployeeCurricularActivitySeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $activities = [
            [
                'event_name' => 'Annual Sports Meet',
                'discipline' => 'Athletics',
                'prize_awarded' => 'First Place in 100m Sprint'
            ],
            [
                'event_name' => 'Cultural Festival',
                'discipline' => 'Dance',
                'prize_awarded' => 'Best Performance Award'
            ],
            [
                'event_name' => 'Tech Symposium',
                'discipline' => 'Technical Presentation',
                'prize_awarded' => 'Best Innovation Award'
            ],
            [
                'event_name' => 'Debate Competition',
                'discipline' => 'Public Speaking',
                'prize_awarded' => 'Best Speaker Award'
            ],
            [
                'event_name' => 'Art Exhibition',
                'discipline' => 'Fine Arts',
                'prize_awarded' => 'Excellence in Painting'
            ],
            [
                'event_name' => 'Music Competition',
                'discipline' => 'Instrumental',
                'prize_awarded' => 'Best Guitarist'
            ]
        ];

        foreach ($employees as $employee) {
            // Create 2-4 activities for each employee
            $numActivities = rand(2, 4);
            $selectedActivities = array_rand($activities, $numActivities);
            
            if (!is_array($selectedActivities)) {
                $selectedActivities = [$selectedActivities];
            }

            foreach ($selectedActivities as $index) {
                $activity = $activities[$index];
                EmployeeCurricularActivity::create([
                    'employee_id' => $employee->id,
                    'event_name' => $activity['event_name'],
                    'discipline' => $activity['discipline'],
                    'prize_awarded' => $activity['prize_awarded'],
                    'event_year' => now()->subYears(rand(1, 5))
                ]);
            }
        }
    }
} 