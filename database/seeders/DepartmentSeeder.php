<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Handles employee management and HR operations'
            ],
            [
                'name' => 'Sales',
                'code' => 'SALES',
                'description' => 'Manages sales operations and customer relationships'
            ],
            [
                'name' => 'Purchase',
                'code' => 'PUR',
                'description' => 'Handles procurement and vendor management'
            ],
            [
                'name' => 'Inventory',
                'code' => 'INV',
                'description' => 'Manages stock and equipment inventory'
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Handles financial operations and accounting'
            ],
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Manages IT infrastructure and systems'
            ]
        ];

        foreach ($departments as $department) {
            Department::firstOrCreate(
                ['code' => $department['code']],
                $department
            );
        }
    }
} 