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
        Schema::create('sales_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique(); // Auto-generated unique order number
            $table->foreignId('quotation_id')->nullable()->constrained('quotations')->nullOnDelete();
            $table->foreignId('enquiry_id')->nullable()->constrained('enquiries')->nullOnDelete();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('client_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Order Details
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'confirmed',       // Confirmed by client
                'in_progress',     // Order in progress
                'ready_for_dispatch', // Ready for dispatch
                'dispatched',      // Dispatched to client
                'delivered',       // Delivered to client
                'completed',       // Order completed
                'cancelled',       // Cancelled order
                'on_hold'         // Order on hold
            ])->default('draft');
            
            // Approval Details
            $table->enum('approval_status', [
                'pending',         // Waiting for approval
                'approved',        // Approved
                'rejected',        // Rejected
                'not_required'     // No approval needed
            ])->default('not_required');
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_remarks')->nullable();
            
            // Dates
            $table->date('order_date');
            $table->date('required_date')->nullable();
            $table->date('confirmed_date')->nullable();
            $table->date('dispatch_date')->nullable();
            $table->date('delivery_date')->nullable();
            $table->date('completion_date')->nullable();
            
            // Financial Details
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            
            // Payment Details
            $table->decimal('advance_amount', 12, 2)->default(0);
            $table->decimal('advance_paid', 12, 2)->default(0);
            $table->decimal('balance_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->integer('payment_terms_days')->default(0);
            $table->text('payment_terms')->nullable();
            $table->text('payment_remarks')->nullable();
            
            // Delivery Details
            $table->string('delivery_state')->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('delivery_contact_person')->nullable();
            $table->string('delivery_contact_phone')->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->text('site_details')->nullable();
            
            // Dispatch Details
            $table->string('dispatch_mode')->nullable(); // Transport mode
            $table->string('vehicle_number')->nullable();
            $table->string('transporter_name')->nullable();
            $table->string('lr_number')->nullable(); // Lorry Receipt number
            $table->date('lr_date')->nullable();
            $table->text('dispatch_remarks')->nullable();
            
            // Billing Details
            $table->string('billing_state')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('billing_gstin')->nullable();
            $table->string('billing_pan')->nullable();
            $table->text('billing_instructions')->nullable();
            
            // Additional Details
            $table->text('special_instructions')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->text('client_remarks')->nullable();
            
            // Document Details
            $table->string('order_document_path')->nullable(); // Path to generated PDF
            $table->string('delivery_challan_path')->nullable();
            $table->string('invoice_path')->nullable();
            
            // Soft deletes for data retention
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_orders');
    }
};
