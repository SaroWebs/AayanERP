<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\ClientDetailController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\EquipmentSeriesController;

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

    Route::prefix('equipment')->name('equipment.')->group(function () {
        Route::get('/equipment/data', [EquipmentController::class, 'data'])->name('equipment.data');
        Route::resource('equipment', EquipmentController::class);
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
        // Public route for getting last code
        Route::get('items/last-code', [ItemController::class, 'getLastCode'])->name('items.last-code');

        // Protected routes
        Route::middleware(['auth'])->group(function () {
            // Categories
            Route::controller(CategoryController::class)->group(function () {
                Route::get('/categories', 'index')->name('categories.index');
                Route::post('/categories', 'store')->name('categories.store');
                Route::put('/categories/{category}', 'update')->name('categories.update');
                Route::put('/categories/{category}/status', 'updateStatus')->name('categories.status.update');
                Route::delete('/categories/{category}', 'destroy')->name('categories.destroy');
                Route::post('/categories/{category}/restore', 'restore')->name('categories.restore');

                Route::get('/category-types', 'indexTypes')->name('category-types.index');
                Route::post('/category-types', 'storeType')->name('category-types.store');
                Route::put('/category-types/{categoryType}', 'updateType')->name('category-types.update');
                Route::put('/category-types/{categoryType}/status', 'updateTypeStatus')->name('category-types.status.update');
                Route::delete('/category-types/{categoryType}', 'destroyType')->name('category-types.destroy');
                Route::post('/category-types/{categoryType}/restore', 'restoreType')->name('category-types.restore');

                // New routes for fetching categories and category types
                Route::get('/data/categories', 'getCategories')->name('categories.data');
                Route::get('/data/category-types', 'getCategoryTypes')->name('category-types.data');
            });

            // Equipment Series
            Route::controller(EquipmentSeriesController::class)->group(function () {
                Route::get('series', 'index')->name('series.index');
                Route::post('series', 'store')->name('series.store');
                Route::put('series/{equipmentSeries}', 'update')->name('series.update');
                Route::delete('series/{equipmentSeries}', 'destroy')->name('series.destroy');
                Route::post('series/{equipmentSeries}/restore', 'restore')->name('series.restore');
            });

            // Equipment
            Route::controller(EquipmentController::class)->group(function () {
                Route::get('equipment', 'index')->name('equipment.index');
                Route::post('equipment', 'store')->name('equipment.store');
                Route::put('equipment/{equipment}', 'update')->name('equipment.update');
                Route::delete('equipment/{equipment}', 'destroy')->name('equipment.destroy');
                Route::post('equipment/{equipment}/restore', 'restore')->name('equipment.restore');
                Route::put('equipment/{equipment}/maintenance', 'updateMaintenance')->name('equipment.maintenance.update');
            });

            // Items
            Route::controller(ItemController::class)->group(function () {
                Route::get('items', 'index')->name('items.index');
                Route::get('data/items', 'getData')->name('items.data');
                Route::post('items', 'store')->name('items.store');
                Route::get('items/{item}', 'show')->name('items.show');
                Route::put('items/{item}', 'update')->name('items.update');
                Route::delete('items/{item}', 'destroy')->name('items.destroy');
                Route::post('items/{item}/restore', 'restore')->name('items.restore');
            });
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
