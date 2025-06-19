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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('quotation_no')->unique(); // Auto-generated unique quotation number
            $table->foreignId('enquiry_id')->constrained('enquiries')->cascadeOnDelete();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('client_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Quotation Details
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['equipment', 'scaffolding', 'both'])->default('equipment');
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'sent',           // Sent to client
                'accepted',       // Accepted by client
                'rejected',       // Rejected by client
                'expired',        // Quotation expired
                'converted',      // Converted to sales order
                'cancelled'       // Cancelled quotation
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
            $table->date('quotation_date');
            $table->date('valid_until');
            $table->date('accepted_date')->nullable();
            $table->date('converted_date')->nullable();
            
            // Financial Details
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            
            // Payment Terms
            $table->integer('payment_terms_days')->default(0); // Net days for payment
            $table->decimal('advance_percentage', 5, 2)->default(0); // Advance payment percentage
            $table->text('payment_terms')->nullable();
            $table->text('delivery_terms')->nullable();
            
            // Location Details
            $table->string('deployment_state')->nullable();
            $table->string('location')->nullable();
            $table->text('site_details')->nullable();
            
            // Additional Details
            $table->text('special_conditions')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->text('client_remarks')->nullable();
            
            // Tracking
            $table->string('document_path')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->string('sent_by')->nullable();
            $table->string('sent_via')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
