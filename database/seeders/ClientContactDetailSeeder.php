<?php

namespace Database\Seeders;

use App\Models\ClientContactDetail;
use Illuminate\Database\Seeder;

class ClientContactDetailSeeder extends Seeder
{
    public function run(): void
    {
        $contactDetails = [
            [
                'client_detail_id' => 1,
                'contact_person' => 'Robert Johnson',
                'department' => 'Purchase',
                'designation' => 'Purchase Manager',
                'phone' => '9876543210',
                'email' => 'robert@globalindustries.com'
            ],
            [
                'client_detail_id' => 2,
                'contact_person' => 'Sarah Williams',
                'department' => 'Procurement',
                'designation' => 'Procurement Head',
                'phone' => '9876543211',
                'email' => 'sarah@regionalsolutions.com'
            ],
        ];

        foreach ($contactDetails as $contact) {
            ClientContactDetail::create($contact);
        }
    }
} 