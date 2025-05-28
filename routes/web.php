<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ClientDetailController;
use App\Http\Controllers\ConfigurationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    Route::controller(ClientDetailController::class)->group(function () {
        Route::get('master/clients', 'index');
        Route::get('data/clients', 'paginatedlist');
    });
});

// only admin
Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::controller(VendorController::class)->group(function () {
        // Views
        Route::get('master/vendors', 'index'); // listing page/view

        // Store
        Route::get('/data/vendors', 'getVendors')->name('vendor.list'); // full vendor creation
        Route::post('/data/vendors/add', 'store')->name('vendor.store'); // full vendor creation

        // Modular Updates (part-by-part)
        Route::patch('/data/vendors/{vendor}/basic', 'updateBasic')->name('vendor.update.basic');
        Route::patch('/data/vendors/{vendor}/bank-accounts', 'updateBankAccounts')->name('vendor.update.bank');
        Route::patch('/data/vendors/{vendor}/contact-details', 'updateContactDetails')->name('vendor.update.contact');
        Route::patch('/data/vendors/{vendor}/documents', 'updateDocuments')->name('vendor.update.documents');

        // Optional: A unified update endpoint if needed
        Route::patch('/data/vendors/{vendor}', 'update')->name('vendor.update');

        // Deletion
        Route::delete('/data/vendors/{vendor}', 'destroy')->name('vendor.destroy');
        Route::delete('/data/vendors/{vendor}/document/{docId}', 'deleteDocument')->name('vendor.document.delete');
    });
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
        Route::delete('/data/config/permissions/module/{module}/delete', 'deletePermissionByModule');

        // users
        Route::get('configuration/users', 'usersPage');
        Route::get('/data/config/users', 'usersData');
        Route::post('/data/config/users/assign-roles', 'assignRolesToUser');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
