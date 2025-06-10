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
use App\Http\Controllers\EnquiryController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SalesOrderController;
use App\Http\Controllers\SalesBillController;
use App\Http\Controllers\SalesPaymentController;
use App\Http\Controllers\PurchaseIntentController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\GoodsReceiptNoteController;
use App\Http\Controllers\PurchasePaymentController;

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
        Route::get('master/clients/{client}', 'show');
        Route::post('data/clients/add', 'store');
        Route::patch('data/clients/{client}/basic', 'updateBasic');
        Route::patch('data/clients/{client}/bank-accounts', 'updateBankAccounts');
        Route::patch('data/clients/{client}/contact-details', 'updateContactDetails');
        Route::patch('data/clients/{client}/documents', 'updateDocuments');
        Route::delete('data/clients/{client}', 'destroy');
        Route::delete('data/documents/{document}', 'deleteDocument');
        
        // New routes for partial insertion
        Route::post('data/clients/{client}/bank-accounts', 'addBankAccount');
        Route::post('data/clients/{client}/contact-details', 'addContactDetail');
        Route::post('data/clients/{client}/documents', 'addDocument');
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
        Route::get('items/last-code', [ItemController::class, 'getLastCode'])->name('items.last-code');

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
            Route::get('data/items/{item}', 'getItem')->name('items.get');
            Route::post('items', 'store')->name('items.store');
            Route::get('items/{item}', 'show')->name('items.show');
            Route::put('items/{item}', 'update')->name('items.update');
            Route::delete('items/{item}', 'destroy')->name('items.destroy');
            Route::post('items/{item}/restore', 'restore')->name('items.restore');
            Route::post('items/{item}/stock-movement', 'storeStockMovement')->name('items.stock-movement.store');
            Route::delete('items/{item}/stock-movement/{movement}', 'destroyStockMovement')->name('items.stock-movement.destroy');
        });
        
    });

    Route::prefix('sales')->name('sales.')->group(function(){
        // Enquiries
        Route::controller(EnquiryController::class)->group(function () {
            Route::get('enquiries', 'index')->name('enquiries.index');
            Route::get('enquiries/data', 'data')->name('enquiries.data');
            Route::get('enquiries/get-equipment-list', 'getEquipment')->name('enquiries.equipment');
            
            // CRUD routes
            Route::post('enquiries', 'store')->name('enquiries.store');
            Route::put('enquiries/{enquiry}', 'update')->name('enquiries.update');
            Route::delete('enquiries/{enquiry}', 'destroy')->name('enquiries.destroy');
            
            // Workflow actions
            Route::post('enquiries/{enquiry}/submit', 'submitForReview')->name('enquiries.submit');
            Route::post('enquiries/{enquiry}/approve', 'approve')->name('enquiries.approve');
            Route::post('enquiries/{enquiry}/reject', 'reject')->name('enquiries.reject');
            Route::post('enquiries/{enquiry}/convert', 'convertToQuotation')->name('enquiries.convert');
            Route::post('enquiries/{enquiry}/cancel', 'cancel')->name('enquiries.cancel');
        });

        // Quotations
        Route::controller(QuotationController::class)->group(function () {
            Route::get('quotations', 'index')->name('quotations.index');
            Route::get('data/quotations', 'paginatedList')->name('quotations.data');
            Route::post('data/quotations', 'store')->name('quotations.store');
            Route::get('quotations/{quotation}', 'show')->name('quotations.show');
            Route::put('data/quotations/{quotation}', 'update')->name('quotations.update');
            Route::delete('data/quotations/{quotation}', 'destroy')->name('quotations.destroy');
            
            // Workflow actions
            Route::post('data/quotations/{quotation}/submit', 'submitForReview')->name('quotations.submit');
            Route::post('data/quotations/{quotation}/approve', 'approve')->name('quotations.approve');
            Route::post('data/quotations/{quotation}/reject', 'reject')->name('quotations.reject');
            Route::post('data/quotations/{quotation}/convert', 'convertToSalesOrder')->name('quotations.convert');
            Route::post('data/quotations/{quotation}/cancel', 'cancel')->name('quotations.cancel');
        });

        // Sales Orders
        Route::controller(SalesOrderController::class)->group(function () {
            Route::get('orders', 'index')->name('orders.index');
            Route::get('data/orders', 'paginatedList')->name('orders.data');
            Route::post('data/orders', 'store')->name('orders.store');
            Route::get('orders/{order}', 'show')->name('orders.show');
            Route::put('data/orders/{order}', 'update')->name('orders.update');
            Route::delete('data/orders/{order}', 'destroy')->name('orders.destroy');
            
            // Workflow actions
            Route::post('data/orders/{order}/submit', 'submitForReview')->name('orders.submit');
            Route::post('data/orders/{order}/approve', 'approve')->name('orders.approve');
            Route::post('data/orders/{order}/reject', 'reject')->name('orders.reject');
            Route::post('data/orders/{order}/dispatch', 'dispatch')->name('orders.dispatch');
            Route::post('data/orders/{order}/cancel', 'cancel')->name('orders.cancel');
        });

        // Sales Bills
        Route::controller(SalesBillController::class)->group(function () {
            Route::get('bills', 'index')->name('bills.index');
            Route::get('data/bills', 'paginatedList')->name('bills.data');
            Route::post('data/bills', 'store')->name('bills.store');
            Route::get('bills/{bill}', 'show')->name('bills.show');
            Route::put('data/bills/{bill}', 'update')->name('bills.update');
            Route::delete('data/bills/{bill}', 'destroy')->name('bills.destroy');
            
            // Workflow actions
            Route::post('data/bills/{bill}/submit', 'submitForReview')->name('bills.submit');
            Route::post('data/bills/{bill}/approve', 'approve')->name('bills.approve');
            Route::post('data/bills/{bill}/reject', 'reject')->name('bills.reject');
            Route::post('data/bills/{bill}/cancel', 'cancel')->name('bills.cancel');
        });

        // Sales Payments
        Route::controller(SalesPaymentController::class)->group(function () {
            Route::get('payments', 'index')->name('payments.index');
            Route::get('data/payments', 'paginatedList')->name('payments.data');
            Route::post('data/payments', 'store')->name('payments.store');
            Route::get('payments/{payment}', 'show')->name('payments.show');
            Route::put('data/payments/{payment}', 'update')->name('payments.update');
            Route::delete('data/payments/{payment}', 'destroy')->name('payments.destroy');
            
            // Workflow actions
            Route::post('data/payments/{payment}/approve', 'approve')->name('payments.approve');
            Route::post('data/payments/{payment}/reject', 'reject')->name('payments.reject');
            Route::post('data/payments/{payment}/receive', 'markAsReceived')->name('payments.receive');
            Route::post('data/payments/{payment}/bounce', 'markAsBounced')->name('payments.bounce');
            Route::post('data/payments/{payment}/cancel', 'cancel')->name('payments.cancel');
        });
    });
    
    Route::prefix('purchases')->name('purchases.')->group(function(){
        // Purchase Intents
        Route::controller(PurchaseIntentController::class)->group(function () {
            Route::get('intents', 'index')->name('intents.index');
            Route::get('data/intents', 'paginatedList')->name('intents.data');
            Route::post('data/intents', 'store')->name('intents.store');
            Route::get('intents/{intent}', 'show')->name('intents.show');
            Route::put('data/intents/{intent}', 'update')->name('intents.update');
            Route::delete('data/intents/{intent}', 'destroy')->name('intents.destroy');
            
            // Workflow actions
            Route::post('data/intents/{intent}/submit', 'submitForReview')->name('intents.submit');
            Route::post('data/intents/{intent}/approve', 'approve')->name('intents.approve');
            Route::post('data/intents/{intent}/reject', 'reject')->name('intents.reject');
            Route::post('data/intents/{intent}/convert', 'convertToPurchaseOrder')->name('intents.convert');
            Route::post('data/intents/{intent}/cancel', 'cancel')->name('intents.cancel');
        });

        // Purchase Orders
        Route::controller(PurchaseOrderController::class)->group(function () {
            Route::get('orders', 'index')->name('orders.index');
            Route::get('data/orders', 'paginatedList')->name('orders.data');
            Route::post('data/orders', 'store')->name('orders.store');
            Route::get('orders/{order}', 'show')->name('orders.show');
            Route::put('data/orders/{order}', 'update')->name('orders.update');
            Route::delete('data/orders/{order}', 'destroy')->name('orders.destroy');
            
            // Workflow actions
            Route::post('data/orders/{order}/submit', 'submitForReview')->name('orders.submit');
            Route::post('data/orders/{order}/approve', 'approve')->name('orders.approve');
            Route::post('data/orders/{order}/reject', 'reject')->name('orders.reject');
            Route::post('data/orders/{order}/cancel', 'cancel')->name('orders.cancel');
        });

        // Goods Receipt Notes
        Route::controller(GoodsReceiptNoteController::class)->group(function () {
            Route::get('grns', 'index')->name('grns.index');
            Route::get('data/grns', 'paginatedList')->name('grns.data');
            Route::post('data/grns', 'store')->name('grns.store');
            Route::get('grns/{grn}', 'show')->name('grns.show');
            Route::put('data/grns/{grn}', 'update')->name('grns.update');
            Route::delete('data/grns/{grn}', 'destroy')->name('grns.destroy');
            
            // Workflow actions
            Route::post('data/grns/{grn}/submit', 'submitForReview')->name('grns.submit');
            Route::post('data/grns/{grn}/approve', 'approve')->name('grns.approve');
            Route::post('data/grns/{grn}/reject', 'reject')->name('grns.reject');
            Route::post('data/grns/{grn}/receive', 'markAsReceived')->name('grns.receive');
            Route::post('data/grns/{grn}/inspect', 'completeInspection')->name('grns.inspect');
            Route::post('data/grns/{grn}/return', 'returnGoods')->name('grns.return');
            Route::post('data/grns/{grn}/cancel', 'cancel')->name('grns.cancel');
        });

        // Purchase Payments
        Route::controller(PurchasePaymentController::class)->group(function () {
            Route::get('payments', 'index')->name('payments.index');
            Route::get('data/payments', 'paginatedList')->name('payments.data');
            Route::post('data/payments', 'store')->name('payments.store');
            Route::get('payments/{payment}', 'show')->name('payments.show');
            Route::put('data/payments/{payment}', 'update')->name('payments.update');
            Route::delete('data/payments/{payment}', 'destroy')->name('payments.destroy');
            
            // Workflow actions
            Route::post('data/payments/{payment}/approve', 'approve')->name('payments.approve');
            Route::post('data/payments/{payment}/reject', 'reject')->name('payments.reject');
            Route::post('data/payments/{payment}/receive', 'markAsReceived')->name('payments.receive');
            Route::post('data/payments/{payment}/bounce', 'markAsBounced')->name('payments.bounce');
            Route::post('data/payments/{payment}/cancel', 'cancel')->name('payments.cancel');
        });
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
