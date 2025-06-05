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
            $table->string('po_no')->unique(); // Auto-generated unique PO number
            $table->foreignId('purchase_intent_id')->nullable()->constrained('purchase_intents')->nullOnDelete();
            $table->foreignId('supplier_id')->constrained('supplier_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('supplier_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            
            // PO Details
            $table->string('subject');
            $table->text('description')->nullable();
            $table->enum('type', ['equipment', 'scaffolding', 'spares', 'consumables', 'other'])->default('equipment');
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'sent',           // Sent to supplier
                'acknowledged',    // Acknowledged by supplier
                'in_progress',     // Order in progress
                'partially_received', // Partially received
                'received',        // Fully received
                'cancelled',       // Order cancelled
                'closed'          // Order closed
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
            $table->date('po_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('acknowledgement_date')->nullable();
            $table->date('sent_date')->nullable();
            $table->date('cancellation_date')->nullable();
            $table->date('closing_date')->nullable();
            
            // Financial Details
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('advance_amount', 12, 2)->default(0);
            $table->decimal('balance_amount', 12, 2)->default(0);
            $table->string('currency', 3)->default('INR');
            
            // Payment Terms
            $table->text('payment_terms')->nullable();
            $table->text('delivery_terms')->nullable();
            $table->text('warranty_terms')->nullable();
            
            // Delivery Details
            $table->string('delivery_address')->nullable();
            $table->string('delivery_contact_person')->nullable();
            $table->string('delivery_phone')->nullable();
            $table->text('delivery_instructions')->nullable();
            
            // Additional Details
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->text('supplier_remarks')->nullable();
            
            // Document Details
            $table->string('po_document_path')->nullable(); // Path to generated PDF
            $table->string('acknowledgement_document_path')->nullable();
            
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
        Schema::dropIfExists('purchase_orders');
    }
};
