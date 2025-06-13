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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_no')->unique();
            $table->foreignId('purchase_intent_id')->constrained('purchase_intents')->onDelete('restrict');
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('restrict');
            $table->foreignId('department_id')->constrained('departments')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            
            // Order Details
            $table->date('po_date');
            $table->date('expected_delivery_date');
            $table->string('delivery_location');
            $table->string('payment_terms');
            $table->string('delivery_terms');
            $table->string('warranty_terms')->nullable();
            $table->text('special_instructions')->nullable();
            
            // Financial Details
            $table->decimal('total_amount', 15, 2);
            $table->decimal('tax_amount', 15, 2);
            $table->decimal('freight_amount', 15, 2)->default(0);
            $table->decimal('insurance_amount', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2);
            $table->string('currency')->default('INR');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            
            // Quality and Inspection
            $table->text('quality_requirements')->nullable();
            $table->text('inspection_requirements')->nullable();
            $table->text('testing_requirements')->nullable();
            $table->text('certification_requirements')->nullable();
            
            // Status and Tracking
            $table->string('status')->default('draft'); // draft, pending_approval, approved, sent, acknowledged, partial_received, received, cancelled, closed
            $table->date('approval_date')->nullable();
            $table->date('sent_date')->nullable();
            $table->date('acknowledgement_date')->nullable();
            $table->date('cancellation_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Performance Tracking
            $table->date('actual_delivery_date')->nullable();
            $table->integer('delivery_delay_days')->nullable();
            $table->text('delivery_remarks')->nullable();
            $table->text('quality_remarks')->nullable();
            
            // Document References
            $table->string('quotation_reference')->nullable();
            $table->string('contract_reference')->nullable();
            $table->string('project_reference')->nullable();
            
            // Soft deletes for data retention
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['po_no', 'status']);
            $table->index(['vendor_id', 'status']);
            $table->index(['department_id', 'status']);
            $table->index('expected_delivery_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
