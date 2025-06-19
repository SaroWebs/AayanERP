<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmpDocument;
use Illuminate\Database\Seeder;

class EmployeeDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::all();

        foreach ($employees as $employee) {
            // Create PAN Card document
            EmpDocument::create([
                'employee_id' => $employee->id,
                'category' => 'pan_card',
                'name' => 'PAN Card',
                'number' => $employee->pan_no,
                'type' => 'pdf',
                'remarks' => 'PAN Card for ' . $employee->first_name,
                'sharing_option' => 'private',
                'issued_by' => 'Income Tax Department',
                'issued_date' => now()->subYears(2),
                'document_url' => 'documents/pan/' . $employee->id . '.pdf'
            ]);

            // Create Aadhar Card document
            EmpDocument::create([
                'employee_id' => $employee->id,
                'category' => 'identity_proof',
                'name' => 'Aadhar Card',
                'number' => $employee->aadhar_no,
                'type' => 'pdf',
                'remarks' => 'Aadhar Card for ' . $employee->first_name,
                'sharing_option' => 'private',
                'issued_by' => 'UIDAI',
                'issued_date' => now()->subYears(3),
                'document_url' => 'documents/aadhar/' . $employee->id . '.pdf'
            ]);

            // Create Address Proof document
            EmpDocument::create([
                'employee_id' => $employee->id,
                'category' => 'address_proof',
                'name' => 'Address Proof',
                'number' => null,
                'type' => 'pdf',
                'remarks' => 'Address proof for ' . $employee->first_name,
                'sharing_option' => 'private',
                'issued_by' => 'Local Authority',
                'issued_date' => now()->subYear(),
                'document_url' => 'documents/address/' . $employee->id . '.pdf'
            ]);
        }
    }
} 