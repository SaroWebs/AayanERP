<?php

use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    Route::get('vendors', [VendorController::class, 'index']);
});

// logged in user
Route::middleware(['auth'])->group(function () {
    
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
