<?php

namespace Database\Seeders;

use App\Models\VendorContactDetail;
use Illuminate\Database\Seeder;

class VendorContactDetailSeeder extends Seeder
{
    public function run(): void
    {
        $contactDetails = [
            [
                'vendor_id' => 1,
                'contact_person' => 'John Doe',
                'department' => 'Sales',
                'designation' => 'Sales Manager',
                'phone' => '9876543210',
                'email' => 'john@abcsuppliers.com'
            ],
            [
                'vendor_id' => 2,
                'contact_person' => 'Jane Smith',
                'department' => 'Purchase',
                'designation' => 'Purchase Manager',
                'phone' => '9876543211',
                'email' => 'jane@xyzmanufacturers.com'
            ],
        ];

        foreach ($contactDetails as $contact) {
            VendorContactDetail::create($contact);
        }
    }
} 