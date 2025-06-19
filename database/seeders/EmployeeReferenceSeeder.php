<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeReference;
use Illuminate\Database\Seeder;

class EmployeeReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();
        $designations = [
            'senior_manager_maintenance',
            'assistant_manager_business_development',
            'project_coordinator',
            'general_manager_production',
            'executive_fa',
            'associate_business_development',
            'store_incharge',
            'trainee_engineer',
            'trainee_engineer_civil',
            'store_assistant',
            'assistant_manager_hr',
            'supervisor',
            'store_assistant_jr',
            'store_keeper_wb_operator',
            'operator_weigh_bridge',
            'operator_weigh_bridge_marketing',
            'foreman_lathe',
            'technician_jr_lathe',
            'supervisor_civil',
            'supervisor_greasing',
            'fitter',
            'welder',
            'denter',
            'sr_mechanic',
            'mechanic',
            'auto_electrician',
            'electrician',
            'jr_electrician',
            'operator_hydra',
            'operator_excavator',
            'operator_jcb',
            'operator_loader',
            'operator_dozer',
            'operator_grader',
            'operator_compactor',
            'operator_roller',
            'operator_bm_roller',
            'operator_paver',
            'operator_batching_plant',
            'crane_operator_technician',
            'driver_tm',
            'driver_hmv',
            'driver_trailer_volvo',
            'driver_trailer_low_bed',
            'tyre_fitter',
            'cook',
            'operator_concrete_pump',
            'operator_slm',
            'operator_boom_placer',
            'mechanic_sr',
            'painter',
            'crane_operator'
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

        $cities = [
            'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
            'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
        ];

        $streets = [
            'Main Road', 'Park Street', 'MG Road', 'Church Street',
            'Commercial Street', 'Market Road', 'Station Road', 'College Road'
        ];

        foreach ($employees as $employee) {
            // Create 2-3 references for each employee
            $numReferences = rand(2, 3);

            for ($i = 0; $i < $numReferences; $i++) {
                $firstName = $firstNames[array_rand($firstNames)];
                $lastName = $lastNames[array_rand($lastNames)];
                $designation = $designations[array_rand($designations)];
                $city = $cities[array_rand($cities)];
                $street = $streets[array_rand($streets)];
                $houseNumber = rand(1, 999);

                EmployeeReference::create([
                    'employee_id' => $employee->id,
                    'reference_name' => $firstName . ' ' . $lastName,
                    'designation' => $designation,
                    'reference_address' => $houseNumber . ', ' . $street . ', ' . $city
                ]);
            }
        }
    }
} 