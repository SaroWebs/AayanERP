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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('hsn')->nullable();
            $table->text('description_1')->nullable();
            $table->text('description_2')->nullable();
            $table->enum('type', ['consumable', 'spare_part', 'tool', 'material', 'other'])->default('consumable');
            $table->enum('unit', ['set', 'nos', 'rmt', 'sqm', 'ltr', 'kg', 'ton', 'box', 'pack', 'na'])->nullable();
            $table->enum('applicable_for', ['all', 'equipment', 'scaffolding', 'refractory'])->default('all');
            $table->enum('status', ['active', 'inactive', 'discontinued'])->default('active');
            
            // Stock Management
            $table->decimal('minimum_stock', 10, 2)->default(0);
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('maximum_stock', 10, 2)->nullable();
            $table->decimal('reorder_point', 10, 2)->nullable();
            $table->decimal('reorder_quantity', 10, 2)->nullable();
            
            // Cost and Pricing
            $table->decimal('standard_cost', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2)->nullable();
            $table->decimal('rental_rate', 10, 2)->nullable();
            
            // Specifications
            $table->json('specifications')->nullable();
            $table->json('technical_details')->nullable();
            $table->json('safety_data')->nullable();
            
            // Location and Storage
            $table->string('storage_location')->nullable();
            $table->string('storage_conditions')->nullable();
            $table->text('storage_instructions')->nullable();
            
            // Additional Details
            $table->string('manufacturer')->nullable();
            $table->string('supplier')->nullable();
            $table->string('warranty_period')->nullable();
            $table->date('last_purchase_date')->nullable();
            $table->decimal('last_purchase_price', 10, 2)->nullable();
            
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
