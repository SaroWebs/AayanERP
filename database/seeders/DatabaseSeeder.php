<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Str;
use App\Models\CategoryType;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@aayan.com',
            'password' => Hash::make('admin1234'),
            'remember_token' => Str::random(60),
        ]);

        Role::create(['name' => 'admin']);
        Role::create(['name' => 'hr']);
        Role::create(['name' => 'sales']);
        Role::create(['name' => 'purchase']);
        
        $modules = ['users', 'roles'];
        $actions = ['create', 'read', 'update', 'delete'];
        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $name = "$module.$action";
                Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            }
        }
    }
}
