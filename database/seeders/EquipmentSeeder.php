<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipment = [
            [
                'code' => 'EQ001',
                'name' => 'Industrial Mixer',
                'slug' => 'industrial-mixer',
                'category_id' => 5, // Manufacturing Equipment
                'description' => 'Heavy-duty industrial mixer for construction materials',
                'make' => 'MixTech',
                'model' => 'MT-5000',
                'serial_no' => 'SN123456',
                'make_year' => 2023,
                'capacity' => '5000L',
                'power_rating' => '50HP',
                'fuel_type' => 'Electric',
                'operating_conditions' => 'Indoor',
                'weight' => 2500.00,
                'dimensions_length' => 300.00,
                'dimensions_width' => 200.00,
                'dimensions_height' => 250.00,
                'color' => 'Blue',
                'material' => 'Stainless Steel',
                'purchase_price' => 500000.00,
                'purchase_date' => '2023-01-15',
                'purchase_order_no' => 'PO123456',
                'supplier' => 'MixTech Industries',
                'rental_rate' => 5000.00,
                'depreciation_rate' => 10.00,
                'current_value' => 450000.00,
                'maintenance_frequency' => 'monthly',
                'last_maintenance_date' => '2024-05-15',
                'next_maintenance_date' => '2024-06-15',
                'maintenance_hours' => 8,
                'maintenance_instructions' => 'Regular cleaning and lubrication required',
                'maintenance_checklist' => json_encode(['Check bearings', 'Lubricate moving parts', 'Inspect electrical connections']),
                'warranty_start_date' => '2023-01-15',
                'warranty_end_date' => '2026-01-15',
                'warranty_terms' => '3 years comprehensive warranty',
                'status' => 'available',
                'current_location' => 'Main Factory',
                'condition' => 'Excellent',
                'usage_hours' => 1000,
                'technical_specifications' => json_encode(['Motor: 50HP', 'Voltage: 440V', 'Phase: 3']),
                'safety_requirements' => json_encode(['Safety guards required', 'Emergency stop button', 'Warning signs']),
                'operating_instructions' => json_encode(['Start sequence', 'Operating parameters', 'Shutdown procedure']),
                'certifications' => json_encode(['ISO 9001', 'CE Certified']),
                'attachments' => json_encode(['Manual.pdf', 'Warranty.pdf']),
                'notes' => 'Primary mixing equipment for construction materials',
                'special_instructions' => 'Requires trained operator',
                'custom_fields' => json_encode(['Custom Field 1' => 'Value 1', 'Custom Field 2' => 'Value 2'])
            ],
            [
                'code' => 'EQ002',
                'name' => 'Forklift',
                'slug' => 'forklift',
                'category_id' => 5, // Manufacturing Equipment
                'description' => 'Heavy-duty forklift for material handling',
                'make' => 'LiftMaster',
                'model' => 'FM-3000',
                'serial_no' => 'SN789012',
                'make_year' => 2023,
                'capacity' => '3000kg',
                'power_rating' => '75HP',
                'fuel_type' => 'Diesel',
                'operating_conditions' => 'Indoor/Outdoor',
                'weight' => 3500.00,
                'dimensions_length' => 250.00,
                'dimensions_width' => 120.00,
                'dimensions_height' => 220.00,
                'color' => 'Yellow',
                'material' => 'Steel',
                'purchase_price' => 750000.00,
                'purchase_date' => '2023-03-20',
                'purchase_order_no' => 'PO789012',
                'supplier' => 'LiftMaster Corp',
                'rental_rate' => 7500.00,
                'depreciation_rate' => 15.00,
                'current_value' => 637500.00,
                'maintenance_frequency' => 'monthly',
                'last_maintenance_date' => '2024-05-20',
                'next_maintenance_date' => '2024-06-20',
                'maintenance_hours' => 12,
                'maintenance_instructions' => 'Regular engine maintenance and hydraulic system check required',
                'maintenance_checklist' => json_encode(['Check engine oil', 'Inspect hydraulic system', 'Check tires']),
                'warranty_start_date' => '2023-03-20',
                'warranty_end_date' => '2026-03-20',
                'warranty_terms' => '3 years comprehensive warranty',
                'status' => 'in_use',
                'current_location' => 'Warehouse',
                'condition' => 'Good',
                'usage_hours' => 1500,
                'technical_specifications' => json_encode(['Engine: Diesel', 'Capacity: 3000kg', 'Lift Height: 6m']),
                'safety_requirements' => json_encode(['Safety harness required', 'Load capacity limits', 'Warning lights']),
                'operating_instructions' => json_encode(['Start procedure', 'Loading guidelines', 'Safety protocols']),
                'certifications' => json_encode(['ISO 9001', 'CE Certified']),
                'attachments' => json_encode(['Manual.pdf', 'Warranty.pdf']),
                'notes' => 'Primary material handling equipment',
                'special_instructions' => 'Requires licensed operator',
                'custom_fields' => json_encode(['Custom Field 1' => 'Value 1', 'Custom Field 2' => 'Value 2'])
            ]
        ];

        foreach ($equipment as $item) {
            Equipment::create($item);
        }
    }
} 