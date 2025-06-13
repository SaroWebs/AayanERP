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
        Schema::create('purchase_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_no')->unique();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->onDelete('restrict');
            $table->foreignId('goods_receipt_note_id')->nullable()->constrained('goods_receipt_notes')->onDelete('restrict');
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('restrict');
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('restrict');
            
            // Payment Details
            $table->enum('type', [
                'advance',         // Advance payment
                'on_delivery',     // Payment on delivery
                'post_delivery',   // Payment after delivery
                'retention',       // Retention payment
                'warranty',        // Warranty payment
                'quality_claim',   // Quality claim payment
                'other'           // Other payment
            ])->default('post_delivery');
            
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'paid',           // Payment made
                'bounced',         // Payment bounced
                'cancelled'        // Payment cancelled
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
            $table->date('payment_date');
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->date('bounce_date')->nullable();
            
            // Financial Details
            $table->decimal('amount', 15, 2);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->string('currency')->default('INR');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->enum('payment_mode', [
                'cash',            // Cash payment
                'bank_transfer',   // Bank transfer
                'cheque',          // Cheque payment
                'upi',            // UPI payment
                'card',           // Card payment
                'letter_of_credit', // Letter of Credit
                'other'           // Other payment mode
            ])->default('bank_transfer');
            
            // Bank Details
            $table->foreignId('vendor_bank_account_id')->nullable()->constrained('vendor_bank_accounts')->onDelete('restrict');
            $table->string('transaction_id')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('upi_id')->nullable();
            $table->string('lc_number')->nullable(); // Letter of Credit number
            $table->date('lc_date')->nullable();
            $table->date('lc_expiry_date')->nullable();
            
            // Quality and Inspection
            $table->text('quality_remarks')->nullable();
            $table->text('inspection_remarks')->nullable();
            $table->text('testing_remarks')->nullable();
            $table->text('certification_remarks')->nullable();
            
            // Additional Details
            $table->text('payment_remarks')->nullable();
            $table->text('bounce_remarks')->nullable();
            $table->text('notes')->nullable();
            
            // Document Details
            $table->string('receipt_path')->nullable(); // Path to generated receipt PDF
            $table->string('payment_proof_path')->nullable(); // Payment proof document
            $table->string('lc_document_path')->nullable(); // Letter of Credit document
            
            // Soft deletes for data retention
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['payment_no', 'status']);
            $table->index(['vendor_id', 'status']);
            $table->index(['purchase_order_id', 'status']);
            $table->index('payment_date');
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_payments');
    }
};
