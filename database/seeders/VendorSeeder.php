<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            [
                'name' => 'ABC Suppliers Ltd',
                'code' => 'V001',
                'type' => 'supplier',
                'status' => 'active',
                'contact_no' => '9876543210',
                'email' => 'contact@abcsuppliers.com',
                'website' => 'www.abcsuppliers.com',
                'gstin' => '27ABCDE1234F1Z5',
                'pan_no' => 'ABCDE1234F',
                'business_type' => 'Private Limited',
                'industry_type' => 'Manufacturing',
                'address' => '123 Industrial Area, Mumbai',
                'city' => 'Mumbai',
                'state' => 'Maharashtra',
                'country' => 'India',
                'pincode' => '400001',
                'bank_name' => 'State Bank of India',
                'bank_branch' => 'Mumbai Main Branch',
                'bank_account_no' => '1234567890',
                'bank_ifsc_code' => 'SBIN0001234',
                'payment_terms' => 'Net 30',
                'delivery_terms' => 'FOB',
                'rating' => 4.5,
                'performance_score' => 90,
            ],
            [
                'name' => 'XYZ Manufacturers',
                'code' => 'V002',
                'type' => 'manufacturer',
                'status' => 'active',
                'contact_no' => '9876543211',
                'email' => 'info@xyzmanufacturers.com',
                'website' => 'www.xyzmanufacturers.com',
                'gstin' => '27XYZDE1234F1Z5',
                'pan_no' => 'XYZDE1234F',
                'business_type' => 'Partnership',
                'industry_type' => 'Manufacturing',
                'address' => '456 Industrial Estate, Delhi',
                'city' => 'Delhi',
                'state' => 'Delhi',
                'country' => 'India',
                'pincode' => '110001',
                'bank_name' => 'HDFC Bank',
                'bank_branch' => 'Delhi Main Branch',
                'bank_account_no' => '0987654321',
                'bank_ifsc_code' => 'HDFC0001234',
                'payment_terms' => 'Net 45',
                'delivery_terms' => 'CIF',
                'rating' => 4.2,
                'performance_score' => 85,
            ],
        ];

        foreach ($vendors as $vendor) {
            Vendor::create($vendor);
        }
    }
} 