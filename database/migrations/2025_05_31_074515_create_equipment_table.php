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
            // Basic Information
            $table->string('code')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignId('equipment_series_id')->nullable()->constrained('equipment_series')->onDelete('set null');
            $table->text('description')->nullable();
            
            // Equipment Details
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_no')->nullable();
            $table->integer('make_year')->nullable();
            $table->string('capacity')->nullable();
            $table->string('power_rating')->nullable();
            $table->string('fuel_type')->nullable();
            $table->string('operating_conditions')->nullable();
            
            // Physical Details
            $table->decimal('weight', 10, 2)->nullable();
            $table->decimal('dimensions_length', 10, 2)->nullable();
            $table->decimal('dimensions_width', 10, 2)->nullable();
            $table->decimal('dimensions_height', 10, 2)->nullable();
            $table->string('color')->nullable();
            $table->string('material')->nullable();
            
            // Financial Details
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->date('purchase_date')->nullable();
            $table->string('purchase_order_no')->nullable();
            $table->string('supplier')->nullable();
            $table->decimal('rental_rate', 10, 2)->nullable();
            $table->decimal('depreciation_rate', 5, 2)->nullable();
            $table->decimal('current_value', 10, 2)->nullable();
            
            // Maintenance Details
            $table->enum('maintenance_frequency', ['daily', 'weekly', 'monthly', 'quarterly', 'bi-annual', 'annual', 'as-needed'])->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->integer('maintenance_hours')->nullable();
            $table->text('maintenance_instructions')->nullable();
            $table->json('maintenance_checklist')->nullable();
            
            // Warranty and Insurance
            $table->date('warranty_start_date')->nullable();
            $table->date('warranty_end_date')->nullable();
            $table->string('warranty_terms')->nullable();
            $table->string('insurance_policy_no')->nullable();
            $table->date('insurance_expiry_date')->nullable();
            $table->string('insurance_coverage')->nullable();
            
            // Location and Status
            $table->enum('status', ['available', 'in_use', 'maintenance', 'repair', 'retired', 'scrapped'])->default('available');
            $table->string('current_location')->nullable();
            $table->string('assigned_to')->nullable();
            $table->string('condition')->nullable();
            $table->integer('usage_hours')->default(0);
            
            // Documentation
            $table->json('technical_specifications')->nullable();
            $table->json('safety_requirements')->nullable();
            $table->json('operating_instructions')->nullable();
            $table->json('certifications')->nullable();
            $table->json('attachments')->nullable();
            
            // Additional Details
            $table->text('notes')->nullable();
            $table->text('special_instructions')->nullable();
            $table->json('custom_fields')->nullable();
            
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
