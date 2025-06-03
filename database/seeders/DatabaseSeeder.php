<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\CategoryType;
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


        // // category types
        // $categoryTypes = [
        //     ['name' => 'Earthmoving Equipment', 'slug' => 'earthmoving-equipment', 'description' => 'Earthmoving Equipment', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Compaction Equipment', 'slug' => 'compaction-equipment', 'description' => 'Compaction Equipment', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Concrete and Asphalt Equipment', 'slug' => 'concrete-and-asphalt-equipment', 'description' => 'Concrete and Asphalt Equipment', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Lifting Equipment', 'slug' => 'lifting-equipment', 'description' => 'Lifting Equipment', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Diesel Generators', 'slug' => 'diesel-generators', 'description' => 'Diesel Generators', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Scaffolding', 'slug' => 'scaffolding', 'description' => 'Scaffolding', 'variant' => 'scaffolding', 'status' => 'active'],
        //     ['name' => 'Shuttering', 'slug' => 'shuttering', 'description' => 'Shuttering', 'variant' => 'scaffolding', 'status' => 'active'],
        //     ['name' => 'Others', 'slug' => 'others-equipment', 'description' => 'Others', 'variant' => 'equipment', 'status' => 'active'],
        //     ['name' => 'Others', 'slug' => 'others-scaffolding', 'description' => 'Others', 'variant' => 'scaffolding', 'status' => 'active'],
        // ];
        // foreach ($categoryTypes as $categoryType) {
        //     CategoryType::create($categoryType);
        // }
    }
}
