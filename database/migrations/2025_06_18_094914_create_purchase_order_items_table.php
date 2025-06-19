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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('item_id')->nullable()->constrained('items')->nullOnDelete();
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
            
            // Item Details
            $table->string('item_name'); // Name of the item/equipment
            $table->string('item_code')->nullable(); // Code of the item
            $table->text('description')->nullable(); // Detailed description
            $table->text('specifications')->nullable(); // Technical specifications
            
            // Quantity and Pricing
            $table->integer('quantity')->default(1);
            $table->string('unit')->nullable(); // nos, set, kg, etc.
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            
            // Additional Details
            $table->text('notes')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('warranty_period')->nullable();
            
            // Delivery Details
            $table->date('expected_delivery_date')->nullable();
            $table->string('delivery_location')->nullable();
            
            // Quality and Inspection
            $table->text('quality_requirements')->nullable();
            $table->text('inspection_requirements')->nullable();
            $table->text('testing_requirements')->nullable();
            
            // Status Tracking
            $table->enum('status', ['pending', 'ordered', 'received', 'cancelled'])->default('pending');
            $table->integer('received_quantity')->default(0);
            $table->date('received_date')->nullable();
            $table->text('receipt_remarks')->nullable();
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['purchase_order_id', 'status']);
            $table->index(['item_id', 'status']);
            $table->index(['equipment_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
