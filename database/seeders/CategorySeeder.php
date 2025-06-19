<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Raw Materials',
                'slug' => 'raw-materials',
                'description' => 'Basic materials used in manufacturing',
                'status' => 'active',
                'sort_order' => 1,
                'technical_requirements' => json_encode(['temperature_resistance', 'chemical_resistance']),
                'application_areas' => json_encode(['manufacturing', 'construction']),
                'quality_standards' => json_encode(['ISO 9001', 'ASTM']),
                'parent_id' => null
            ],
            [
                'name' => 'Finished Goods',
                'slug' => 'finished-goods',
                'description' => 'Completed products ready for sale',
                'status' => 'active',
                'sort_order' => 2,
                'technical_requirements' => json_encode(['durability', 'safety_standards']),
                'application_areas' => json_encode(['retail', 'wholesale']),
                'quality_standards' => json_encode(['ISO 9001', 'CE']),
                'parent_id' => null
            ],
            [
                'name' => 'Spare Parts',
                'slug' => 'spare-parts',
                'description' => 'Replacement parts for equipment',
                'status' => 'active',
                'sort_order' => 3,
                'technical_requirements' => json_encode(['compatibility', 'durability']),
                'application_areas' => json_encode(['maintenance', 'repair']),
                'quality_standards' => json_encode(['ISO 9001', 'OEM']),
                'parent_id' => null
            ],
            [
                'name' => 'Office Equipment',
                'slug' => 'office-equipment',
                'description' => 'Equipment used in office operations',
                'status' => 'active',
                'sort_order' => 4,
                'technical_requirements' => json_encode(['ergonomics', 'energy_efficiency']),
                'application_areas' => json_encode(['office', 'administration']),
                'quality_standards' => json_encode(['ISO 9001', 'Energy Star']),
                'parent_id' => null
            ],
            [
                'name' => 'Manufacturing Equipment',
                'slug' => 'manufacturing-equipment',
                'description' => 'Equipment used in manufacturing process',
                'status' => 'active',
                'sort_order' => 5,
                'technical_requirements' => json_encode(['precision', 'safety']),
                'application_areas' => json_encode(['production', 'assembly']),
                'quality_standards' => json_encode(['ISO 9001', 'CE']),
                'parent_id' => null
            ],
            [
                'name' => 'IT Equipment',
                'slug' => 'it-equipment',
                'description' => 'Computers and related equipment',
                'status' => 'active',
                'sort_order' => 6,
                'technical_requirements' => json_encode(['performance', 'security']),
                'application_areas' => json_encode(['IT', 'networking']),
                'quality_standards' => json_encode(['ISO 9001', 'TCO']),
                'parent_id' => null
            ]
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
} 