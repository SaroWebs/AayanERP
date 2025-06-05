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
        Schema::create('sales_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_no')->unique(); // Auto-generated unique payment number
            $table->foreignId('sales_bill_id')->constrained('sales_bills')->cascadeOnDelete();
            $table->foreignId('sales_order_id')->constrained('sales_orders')->cascadeOnDelete();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Payment Details
            $table->enum('type', [
                'advance',         // Advance payment
                'rental',          // Rental payment
                'damage',          // Damage charges payment
                'transport',       // Transport charges payment
                'other'           // Other payment
            ])->default('rental');
            
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'received',        // Payment received
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
            $table->date('received_date')->nullable();
            $table->date('bounce_date')->nullable();
            
            // Financial Details
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            $table->enum('payment_mode', [
                'cash',            // Cash payment
                'bank_transfer',   // Bank transfer
                'cheque',          // Cheque payment
                'upi',            // UPI payment
                'card',           // Card payment
                'other'           // Other payment mode
            ])->default('bank_transfer');
            
            // Bank Details
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('cheque_number')->nullable();
            $table->date('cheque_date')->nullable();
            $table->string('upi_id')->nullable();
            
            // Additional Details
            $table->text('payment_remarks')->nullable();
            $table->text('bounce_remarks')->nullable();
            $table->text('notes')->nullable();
            
            // Document Details
            $table->string('receipt_path')->nullable(); // Path to generated receipt PDF
            $table->string('payment_proof_path')->nullable(); // Payment proof document
            
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
        Schema::dropIfExists('sales_payments');
    }
};
