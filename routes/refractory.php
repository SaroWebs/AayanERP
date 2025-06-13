<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Refractory\TechnicalSpecificationController;
use App\Http\Controllers\Refractory\QualityControlController;
use App\Http\Controllers\Refractory\CertificationController;
use App\Http\Controllers\Refractory\DocumentationController;
use App\Http\Controllers\Refractory\BatchTrackingController;
use App\Http\Controllers\Refractory\ProductPerformanceController;

Route::middleware(['auth'])->prefix('refractory')->name('refractory.')->group(function () {
    // Technical Specifications
    Route::controller(TechnicalSpecificationController::class)->group(function () {
        Route::get('specifications', 'index')->name('specifications.index');
        Route::get('data/specifications', 'getData')->name('specifications.data');
        Route::post('specifications', 'store')->name('specifications.store');
        Route::put('specifications/{specification}', 'update')->name('specifications.update');
        Route::delete('specifications/{specification}', 'destroy')->name('specifications.destroy');
    });

    // Quality Control
    Route::controller(QualityControlController::class)->group(function () {
        Route::get('quality-control', 'index')->name('quality-control.index');
        Route::get('data/quality-control', 'getData')->name('quality-control.data');
        Route::post('quality-control/inspections', 'storeInspection')->name('quality-control.inspections.store');
        Route::put('quality-control/inspections/{inspection}', 'updateInspection')->name('quality-control.inspections.update');
        Route::post('quality-control/tests', 'storeTest')->name('quality-control.tests.store');
        Route::put('quality-control/tests/{test}', 'updateTest')->name('quality-control.tests.update');
        Route::get('quality-control/reports', 'generateReport')->name('quality-control.reports.generate');
    });

    // Certifications
    Route::controller(CertificationController::class)->group(function () {
        Route::get('certifications', 'index')->name('certifications.index');
        Route::get('data/certifications', 'getData')->name('certifications.data');
        Route::post('certifications', 'store')->name('certifications.store');
        Route::put('certifications/{certification}', 'update')->name('certifications.update');
        Route::delete('certifications/{certification}', 'destroy')->name('certifications.destroy');
        Route::post('certifications/{certification}/renew', 'renew')->name('certifications.renew');
        Route::get('certifications/expiring', 'getExpiringCertifications')->name('certifications.expiring');
    });

    // Documentation
    Route::controller(DocumentationController::class)->group(function () {
        Route::get('documents', 'index')->name('documents.index');
        Route::get('data/documents', 'getData')->name('documents.data');
        Route::post('documents', 'store')->name('documents.store');
        Route::put('documents/{document}', 'update')->name('documents.update');
        Route::delete('documents/{document}', 'destroy')->name('documents.destroy');
        Route::get('documents/{document}/download', 'download')->name('documents.download');
        Route::post('documents/{document}/share', 'share')->name('documents.share');
    });

    // Batch Tracking
    Route::controller(BatchTrackingController::class)->group(function () {
        Route::get('batches', 'index')->name('batches.index');
        Route::get('data/batches', 'getData')->name('batches.data');
        Route::post('batches', 'store')->name('batches.store');
        Route::put('batches/{batch}', 'update')->name('batches.update');
        Route::get('batches/{batch}/history', 'getHistory')->name('batches.history');
        Route::post('batches/{batch}/quality-check', 'storeQualityCheck')->name('batches.quality-check.store');
        Route::get('batches/trace/{code}', 'trace')->name('batches.trace');
    });

    // Product Performance
    Route::controller(ProductPerformanceController::class)->group(function () {
        Route::get('performance', 'index')->name('performance.index');
        Route::get('data/performance', 'getData')->name('performance.data');
        Route::post('performance/metrics', 'storeMetrics')->name('performance.metrics.store');
        Route::get('performance/reports', 'generateReport')->name('performance.reports.generate');
        Route::get('performance/analytics', 'getAnalytics')->name('performance.analytics');
    });
}); 