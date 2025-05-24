<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // $modules = ['users', 'roles'];
        // $actions = ['create', 'read', 'update', 'delete'];
        // foreach ($modules as $module) {
        //     foreach ($actions as $action) {
        //         $name = "$module.$action";
        //         Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        //     }
        // }
    }
}
