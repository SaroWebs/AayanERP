<?php

namespace Database\Seeders;

use App\Models\ClientDetail;
use Illuminate\Database\Seeder;

class ClientDetailSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'name' => 'Global Industries Ltd',
                'contact_no' => '9876543210',
                'email' => 'contact@globalindustries.com',
                'gstin_no' => '27ABCDE1234F1Z5',
                'pan_no' => 'ABCDE1234F',
                'fax' => '022-12345678',
                'state' => 'Maharashtra',
                'address' => '123 Business Park, Mumbai',
                'correspondence_address' => '123 Business Park, Mumbai',
                'company_type' => 'national',
                'turnover' => 9999999.99,
                'range' => 'central',
            ],
            [
                'name' => 'Regional Solutions Pvt Ltd',
                'contact_no' => '9876543211',
                'email' => 'info@regionalsolutions.com',
                'gstin_no' => '27XYZDE1234F1Z5',
                'pan_no' => 'XYZDE1234F',
                'fax' => '022-87654321',
                'state' => 'Maharashtra',
                'address' => '456 Tech Park, Pune',
                'correspondence_address' => '456 Tech Park, Pune',
                'company_type' => 'regional',
                'turnover' => 4999999.99,
                'range' => 'state',
            ],
        ];

        foreach ($clients as $client) {
            ClientDetail::create($client);
        }
    }
} 