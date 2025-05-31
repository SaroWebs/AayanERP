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
        Route::get('master/vendors/{vendor}', 'show'); // listing page/view

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
    // 
    Route::controller(EmployeeController::class)->group(function () {
        Route::get('hr/employees', 'index');
        Route::get('data/employees', 'paginatedlist');
        Route::post('data/employees/add', 'store');
    });
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

    // Equipment Management Routes
    Route::prefix('equipment')->name('equipment.')->group(function () {
        // Category Types
        Route::controller(App\Http\Controllers\CategoryTypeController::class)->group(function () {
            Route::get('category-types', 'index')->name('category-types.index');
            Route::get('category-types/create', 'create')->name('category-types.create');
            Route::post('category-types', 'store')->name('category-types.store');
            Route::get('category-types/{categoryType}', 'show')->name('category-types.show');
            Route::get('category-types/{categoryType}/edit', 'edit')->name('category-types.edit');
            Route::put('category-types/{categoryType}', 'update')->name('category-types.update');
            Route::delete('category-types/{categoryType}', 'destroy')->name('category-types.destroy');
            Route::post('category-types/{categoryType}/restore', 'restore')->name('category-types.restore');
        });

        // Categories
        Route::controller(App\Http\Controllers\CategoryController::class)->group(function () {
            Route::get('categories', 'index')->name('categories.index');
            Route::get('categories/create', 'create')->name('categories.create');
            Route::post('categories', 'store')->name('categories.store');
            Route::get('categories/{category}', 'show')->name('categories.show');
            Route::get('categories/{category}/edit', 'edit')->name('categories.edit');
            Route::put('categories/{category}', 'update')->name('categories.update');
            Route::delete('categories/{category}', 'destroy')->name('categories.destroy');
            Route::post('categories/{category}/restore', 'restore')->name('categories.restore');
        });

        // Equipment Series
        Route::controller(App\Http\Controllers\EquipmentSeriesController::class)->group(function () {
            Route::get('series', 'index')->name('series.index');
            Route::get('series/create', 'create')->name('series.create');
            Route::post('series', 'store')->name('series.store');
            Route::get('series/{equipmentSeries}', 'show')->name('series.show');
            Route::get('series/{equipmentSeries}/edit', 'edit')->name('series.edit');
            Route::put('series/{equipmentSeries}', 'update')->name('series.update');
            Route::delete('series/{equipmentSeries}', 'destroy')->name('series.destroy');
            Route::post('series/{equipmentSeries}/restore', 'restore')->name('series.restore');
        });

        // Equipment
        Route::controller(App\Http\Controllers\EquipmentController::class)->group(function () {
            Route::get('equipment', 'index')->name('equipment.index');
            Route::get('equipment/create', 'create')->name('equipment.create');
            Route::post('equipment', 'store')->name('equipment.store');
            Route::get('equipment/{equipment}', 'show')->name('equipment.show');
            Route::get('equipment/{equipment}/edit', 'edit')->name('equipment.edit');
            Route::put('equipment/{equipment}', 'update')->name('equipment.update');
            Route::delete('equipment/{equipment}', 'destroy')->name('equipment.destroy');
            Route::post('equipment/{equipment}/restore', 'restore')->name('equipment.restore');
            Route::put('equipment/{equipment}/maintenance', 'updateMaintenance')->name('equipment.maintenance.update');
        });

        // Items
        Route::controller(App\Http\Controllers\ItemController::class)->group(function () {
            Route::get('items', 'index')->name('items.index');
            Route::get('items/create', 'create')->name('items.create');
            Route::post('items', 'store')->name('items.store');
            Route::get('items/{item}', 'show')->name('items.show');
            Route::get('items/{item}/edit', 'edit')->name('items.edit');
            Route::put('items/{item}', 'update')->name('items.update');
            Route::delete('items/{item}', 'destroy')->name('items.destroy');
            Route::post('items/{item}/restore', 'restore')->name('items.restore');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
