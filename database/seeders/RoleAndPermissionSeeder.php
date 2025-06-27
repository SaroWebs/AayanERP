<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $roles = ['admin', 'hr', 'sales', 'purchase', 'inventory', 'finance'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        // Create permissions for each module
        $modules = [
            'users', 'roles', 'departments', 'categories',
            'employees', 'items', 'vendors',
            'clients', 'enquiries', 'quotations', 'sales_orders',
            'sales_bills', 'dispatches', 'purchase_intents',
            'purchase_orders', 'goods_receipt_notes'
        ];

        $actions = ['create', 'read', 'update', 'delete'];

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $name = "$module.$action";
                Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            }
        }

        // Assign all permissions to admin role
        $adminRole = Role::findByName('admin');
        $adminRole->givePermissionTo(Permission::all());
    }
} 