<?php

namespace Database\Seeders;

use App\Models\VendorBankAccount;
use Illuminate\Database\Seeder;

class VendorBankAccountSeeder extends Seeder
{
    public function run(): void
    {
        $bankAccounts = [
            [
                'vendor_id' => 1,
                'account_holder_name' => 'ABC Suppliers Ltd',
                'account_number' => '1234567890',
                'bank_name' => 'State Bank of India',
                'ifsc' => 'SBIN0001234',
                'branch_address' => 'Mumbai Main Branch, 123 Banking Street, Mumbai - 400001'
            ],
            [
                'vendor_id' => 2,
                'account_holder_name' => 'XYZ Manufacturers',
                'account_number' => '0987654321',
                'bank_name' => 'HDFC Bank',
                'ifsc' => 'HDFC0001234',
                'branch_address' => 'Delhi Main Branch, 456 Banking Avenue, Delhi - 110001'
            ],
        ];

        foreach ($bankAccounts as $account) {
            VendorBankAccount::create($account);
        }
    }
} 