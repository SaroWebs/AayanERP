<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'code' => 'ITM001',
                'name' => 'Steel Bearings',
                'slug' => 'steel-bearings',
                'category_id' => 3, // Spare Parts
                'hsn' => '8482.10',
                'description_1' => 'High-quality steel bearings for industrial machinery',
                'description_2' => 'Suitable for heavy-duty applications',
                'type' => 'spare_part',
                'unit' => 'nos',
                'applicable_for' => 'equipment',
                'status' => 'active',
                'minimum_stock' => 100.00,
                'current_stock' => 500.00,
                'maximum_stock' => 1000.00,
                'reorder_point' => 150.00,
                'reorder_quantity' => 200.00,
                'standard_cost' => 250.00,
                'selling_price' => 350.00,
                'specifications' => json_encode([
                    'Material' => 'Steel',
                    'Size' => '50mm',
                    'Load Capacity' => '5000kg'
                ]),
                'technical_details' => json_encode([
                    'Temperature Range' => '-20°C to 120°C',
                    'Speed Rating' => '3000 RPM',
                    'Precision Class' => 'P6'
                ]),
                'safety_data' => json_encode([
                    'Handling' => 'Use gloves',
                    'Storage' => 'Keep in dry place',
                    'Disposal' => 'Recycle as metal'
                ]),
                'storage_location' => 'Warehouse A',
                'storage_conditions' => 'Dry and cool',
                'storage_instructions' => 'Store in original packaging',
                'manufacturer' => 'BearTech Industries',
                'supplier' => 'Global Bearings Ltd',
                'warranty_period' => '1 year',
                'last_purchase_date' => '2024-01-15',
                'last_purchase_price' => 240.00,
                'sort_order' => 1
            ],
            [
                'code' => 'ITM002',
                'name' => 'Industrial Lubricant',
                'slug' => 'industrial-lubricant',
                'category_id' => 1, // Raw Materials
                'hsn' => '2710.19',
                'description_1' => 'High-performance industrial lubricant',
                'description_2' => 'Suitable for heavy machinery',
                'type' => 'consumable',
                'unit' => 'ltr',
                'applicable_for' => 'equipment',
                'status' => 'active',
                'minimum_stock' => 50.00,
                'current_stock' => 200.00,
                'maximum_stock' => 500.00,
                'reorder_point' => 75.00,
                'reorder_quantity' => 100.00,
                'standard_cost' => 800.00,
                'selling_price' => 1000.00,
                'specifications' => json_encode([
                    'Type' => 'Synthetic',
                    'Viscosity' => 'ISO 68',
                    'Base Oil' => 'Polyalphaolefin'
                ]),
                'technical_details' => json_encode([
                    'Flash Point' => '220°C',
                    'Pour Point' => '-40°C',
                    'Viscosity Index' => '140'
                ]),
                'safety_data' => json_encode([
                    'Handling' => 'Use protective gloves',
                    'Storage' => 'Keep away from heat',
                    'Disposal' => 'Follow local regulations'
                ]),
                'storage_location' => 'Warehouse B',
                'storage_conditions' => 'Cool and dry',
                'storage_instructions' => 'Store in sealed containers',
                'manufacturer' => 'LubeTech',
                'supplier' => 'Industrial Supplies Co',
                'warranty_period' => '2 years',
                'last_purchase_date' => '2024-02-20',
                'last_purchase_price' => 780.00,
                'sort_order' => 2
            ]
        ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
} 