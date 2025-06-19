<?php

namespace Database\Seeders;

use App\Models\ClientBankAccount;
use Illuminate\Database\Seeder;

class ClientBankAccountSeeder extends Seeder
{
    public function run(): void
    {
        $bankAccounts = [
            [
                'client_detail_id' => 1,
                'account_holder_name' => 'Global Industries Ltd',
                'account_number' => '1234567890',
                'bank_name' => 'State Bank of India',
                'ifsc' => 'SBIN0001234',
                'branch_address' => 'Mumbai Main Branch, 123 Banking Street, Mumbai - 400001'
            ],
            [
                'client_detail_id' => 2,
                'account_holder_name' => 'Regional Solutions Pvt Ltd',
                'account_number' => '0987654321',
                'bank_name' => 'HDFC Bank',
                'ifsc' => 'HDFC0001234',
                'branch_address' => 'Pune Main Branch, 456 Banking Avenue, Pune - 411001'
            ],
        ];

        foreach ($bankAccounts as $account) {
            ClientBankAccount::create($account);
        }
    }
} 