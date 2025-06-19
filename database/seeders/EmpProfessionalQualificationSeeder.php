<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmpProfessionalQualification;
use Illuminate\Database\Seeder;

class EmpProfessionalQualificationSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create PMP certification
            EmpProfessionalQualification::create([
                'employee_id' => $employee->id,
                'exam_name' => 'Project Management Professional (PMP)',
                'institution' => 'Project Management Institute',
                'division' => 'First Class',
                'completion_year' => 2018,
                'certificate_number' => 'PMP-' . str_pad($employee->id, 6, '0', STR_PAD_LEFT),
                'valid_from' => '2018-01-01',
                'valid_until' => '2024-01-01',
                'remarks' => 'Project Management Professional Certification'
            ]);

            // Create AWS certification
            EmpProfessionalQualification::create([
                'employee_id' => $employee->id,
                'exam_name' => 'AWS Certified Solutions Architect',
                'institution' => 'Amazon Web Services',
                'division' => 'Associate Level',
                'completion_year' => 2019,
                'certificate_number' => 'AWS-' . str_pad($employee->id, 6, '0', STR_PAD_LEFT),
                'valid_from' => '2019-06-01',
                'valid_until' => '2022-06-01',
                'remarks' => 'AWS Cloud Architecture Certification'
            ]);

            // Create Microsoft certification
            EmpProfessionalQualification::create([
                'employee_id' => $employee->id,
                'exam_name' => 'Microsoft Certified: Azure Administrator Associate',
                'institution' => 'Microsoft',
                'division' => 'Associate Level',
                'completion_year' => 2020,
                'certificate_number' => 'MS-' . str_pad($employee->id, 6, '0', STR_PAD_LEFT),
                'valid_from' => '2020-03-01',
                'valid_until' => '2023-03-01',
                'remarks' => 'Microsoft Azure Administration Certification'
            ]);
        }
    }
} 