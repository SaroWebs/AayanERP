<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@aayan.com',
            'password' => Hash::make('admin1234'),
            'remember_token' => Str::random(60),
        ]);
        $admin->assignRole('admin');

        // Create HR user
        $hr = User::create([
            'name' => 'HR Manager',
            'email' => 'hr@aayan.com',
            'password' => Hash::make('hr1234'),
            'remember_token' => Str::random(60),
        ]);
        $hr->assignRole('hr');

        // Create Sales user
        $sales = User::create([
            'name' => 'Sales Manager',
            'email' => 'sales@aayan.com',
            'password' => Hash::make('sales1234'),
            'remember_token' => Str::random(60),
        ]);
        $sales->assignRole('sales');

        // Create Purchase user
        $purchase = User::create([
            'name' => 'Purchase Manager',
            'email' => 'purchase@aayan.com',
            'password' => Hash::make('purchase1234'),
            'remember_token' => Str::random(60),
        ]);
        $purchase->assignRole('purchase');
    }
} 