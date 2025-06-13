<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            // common details
            $table->string('name');
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignId('equipment_series_id')->nullable()->constrained('equipment_series')->onDelete('set null');
            $table->text('details')->nullable();
            $table->decimal('rental_rate', 10, 2)->nullable();

            // Equipment Details
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_no')->nullable();
            $table->string('code')->nullable();
            $table->integer('make_year')->nullable();
            $table->string('capacity')->nullable();

            // Scaffolding Details
            $table->string('stock_unit')->nullable();
            $table->string('unit_weight')->nullable();
            $table->string('rental_unit')->nullable();
            
            // Other Details
            $table->string('status')->default('active');
            $table->string('condition')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();

            // Refractory-specific fields
            $table->string('temperature_rating')->nullable();
            $table->json('chemical_composition')->nullable();
            $table->string('application_type')->nullable();
            $table->json('technical_specifications')->nullable();
            $table->json('material_safety_data')->nullable();
            $table->text('installation_guidelines')->nullable();
            $table->text('maintenance_requirements')->nullable();
            $table->json('quality_certifications')->nullable();
            $table->json('storage_conditions')->nullable();
            $table->string('batch_number')->nullable();
            $table->date('manufacturing_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->json('physical_properties')->nullable();
            $table->json('dimensional_specifications')->nullable();
            $table->json('visual_inspection_criteria')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
