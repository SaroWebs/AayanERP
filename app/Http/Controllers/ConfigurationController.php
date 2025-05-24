<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ConfigurationController extends Controller
{
    // roles and permissions
    public function roles()
    {
        return Inertia::render('Configuration/Roles');
    }
    

    public function rolesData()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles, 200);
    }

    public function storeRole(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
        ]);

        $role = Role::create([
            'name' => $validatedData['name'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    public function assignRolesToUser(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->syncRoles($validated['roles']); // Replaces existing roles

        return response()->json([
            'status' => 'success',
            'message' => 'Roles assigned successfully.',
            'user' => $user->only(['id', 'name', 'email']),
            'roles' => $user->getRoleNames(),
        ]);
    }



    public function assignPermissionsToRole(Request $request)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
            'permission_ids' => 'array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $role->syncPermissions($validated['permission_ids']);

        return response()->json([
            'status' => 'success',
            'message' => 'Permissions updated successfully.',
            'role' => $role->load('permissions'),
        ]);
    }

    public function permissionsData()
    {
        $permissions = Permission::all();
        return response()->json($permissions, 200);
    }

    public function storePermission(Request $request) {
        $request->validate([
            'module' => 'required|string',
            'actions' => 'required|array|min:1',
            'actions.*' => 'in:create,read,update,delete',
        ]);
    
        foreach ($request->actions as $action) {
            Permission::firstOrCreate([
                'name' => "{$request->module}.{$action}",
                'guard_name' => 'web',
            ]);
        }
    }

    public function updatePermission(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $id,
        ]);

        $permission = Permission::findOrFail($id);
        $permission->name = $validated['name'];
        $permission->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Permission updated successfully.',
            'data' => $permission,
        ]);
    }

    public function deletePermission($id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Permission deleted successfully.',
        ]);
    }
    public function deletePermissionByModule($module)
    {
        $deleted = Permission::where('name', 'LIKE', "$module.%")->delete();

        return response()->json([
            'message' => "Deleted $deleted permission(s) under module '$module'."
        ]);
    }

    // users
    
    public function usersPage()
    {
        return Inertia::render('Configuration/Users');
    }

    public function usersData()
    {
        $users = User::with('roles')->get();
        return response()->json($users, 200);
    }

}
