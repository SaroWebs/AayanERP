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
        Schema::create('sales_bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_no')->unique(); // Auto-generated unique bill number
            $table->foreignId('sales_order_id')->constrained('sales_orders')->cascadeOnDelete();
            $table->foreignId('dispatch_id')->nullable()->constrained('dispatches')->nullOnDelete();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('client_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Bill Details
            $table->enum('type', [
                'advance',         // Advance payment bill
                'rental',          // Rental period bill
                'damage',          // Damage charges bill
                'transport',       // Transport charges bill
                'other'           // Other charges bill
            ])->default('rental');
            
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'sent',           // Sent to client
                'paid',           // Bill paid
                'cancelled',      // Bill cancelled
                'overdue'         // Bill overdue
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
            $table->date('bill_date');
            $table->date('due_date');
            $table->date('sent_date')->nullable();
            $table->date('paid_date')->nullable();
            
            // Financial Details
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            
            // Equipment Details
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->enum('rental_period_unit', ['hours', 'days', 'months', 'years'])->default('days');
            $table->integer('rental_period')->nullable();
            $table->date('rental_start_date')->nullable();
            $table->date('rental_end_date')->nullable();
            
            // Billing Details
            $table->string('billing_state')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('billing_gstin')->nullable();
            $table->string('billing_pan')->nullable();
            $table->text('billing_instructions')->nullable();
            
            // Additional Details
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->text('client_remarks')->nullable();
            
            // Document Details
            $table->string('bill_document_path')->nullable(); // Path to generated PDF
            $table->string('tax_invoice_path')->nullable();
            
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
        Schema::dropIfExists('sales_bills');
    }
};
