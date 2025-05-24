<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ConfigurationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// only admin
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('master/vendors', [VendorController::class, 'index']);
});

Route::middleware(['auth', 'role:hr'])->group(function () {
    Route::get('hr/employees', [EmployeeController::class, 'index']);
});

// logged in user
Route::middleware(['auth'])->group(function () {

    Route::controller(ConfigurationController::class)->group(function () {
        // roles
        Route::get('configuration/roles', 'roles')->name('roles.view');
        Route::get('/data/config/roles', 'rolesData')->name('roles.data');
        Route::post('/data/config/roles/add', 'storeRole')->name('roles.store');
        Route::post('/data/config/roles/assign-permissions', 'assignPermissionsToRole')->name('roles.update');

        //permissions
        Route::get('/data/config/permissions', 'permissionsData');
        Route::post('/data/config/permissions/add', 'storePermission');
        Route::put('/data/config/permissions/{id}/update', 'updatePermission');
        Route::delete('/data/config/permissions/{id}/delete', 'deletePermission');

        // users
        Route::get('configuration/users', 'usersPage');
        Route::get('/data/config/users', 'usersData');
        Route::post('/data/config/users/assign-roles', 'assignRolesToUser');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
