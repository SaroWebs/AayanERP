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
            $table->foreignId('equipment_series_id')->constrained('equipment_series')->cascadeOnDelete();
            $table->text('details')->nullable();
            $table->decimal('rental_rate', 10, 2)->nullable();

            // Equipment Details
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_no')->unique();
            $table->string('code')->unique();
            $table->year('make_year')->nullable();
            $table->string('capacity')->nullable();

            // Scaffolding Details
            $table->string('stock_unit')->nullable();
            $table->string('unit_weight')->nullable();
            $table->string('rental_unit')->nullable();
            
            // Other Details
            $table->enum('status', ['active', 'inactive', 'maintenance', 'retired'])->default('active');
            $table->enum('condition', ['new', 'good', 'fair', 'poor'])->default('good');
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
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
