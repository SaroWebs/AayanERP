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

            // Core Details
            $table->text('description')->nullable();
            $table->string('make')->nullable();
            $table->string('model_no')->nullable();
            $table->string('max_capacity')->nullable();
            $table->string('readability')->nullable();
            $table->string('plateform_size')->nullable();
            $table->string('plateform_moc')->nullable();
            $table->string('indicator_moc')->nullable();
            $table->string('load_plate')->nullable();
            $table->string('indicator_mounding')->nullable();
            $table->string('quality')->nullable();

            $table->enum('type', ['consumable', 'spare_part', 'tool', 'material', 'other'])->default('consumable');
            $table->enum('unit', ['set', 'nos', 'rmt', 'sqm', 'ltr', 'kg', 'ton', 'box', 'pack', 'pcs', 'na'])->nullable();
            $table->enum('status', ['active', 'inactive', 'discontinued', 'maintenance', 'retired'])->default('active');



            // Stock Management
            $table->unsignedInteger('minimum_stock')->default(0);
            $table->unsignedInteger('current_stock')->default(0);
            $table->unsignedInteger('maximum_stock')->nullable();
            $table->unsignedInteger('reorder_point')->nullable();
            $table->unsignedInteger('reorder_quantity')->nullable();

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
            // Other Details
            $table->enum('condition', ['new', 'good', 'fair', 'poor'])->default('good');
            $table->date('last_maintenance_date')->nullable();
            $table->date('next_maintenance_date')->nullable();

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
