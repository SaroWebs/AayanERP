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
        Schema::create('goods_receipt_notes', function (Blueprint $table) {
            $table->id();
            $table->string('grn_no')->unique(); // Auto-generated unique GRN number
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('inspected_by')->nullable()->constrained('users')->nullOnDelete();
            
            // GRN Details
            $table->enum('type', ['full', 'partial', 'return'])->default('full');
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'received',        // Goods received
                'inspected',       // Goods inspected
                'accepted',        // Goods accepted
                'rejected',        // Goods rejected
                'returned',        // Goods returned
                'cancelled'        // GRN cancelled
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
            $table->date('grn_date');
            $table->date('received_date')->nullable();
            $table->date('inspection_date')->nullable();
            $table->date('return_date')->nullable();
            
            // Transport Details
            $table->string('challan_no')->nullable();
            $table->date('challan_date')->nullable();
            $table->string('transport_mode')->nullable();
            $table->string('vehicle_number')->nullable();
            $table->string('transporter_name')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();
            
            // Quality Details
            $table->enum('quality_status', ['pending', 'passed', 'failed', 'conditional'])->default('pending');
            $table->text('quality_remarks')->nullable();
            $table->text('inspection_remarks')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Quantity Details
            $table->integer('total_items')->default(0);
            $table->integer('received_items')->default(0);
            $table->integer('accepted_items')->default(0);
            $table->integer('rejected_items')->default(0);
            $table->integer('returned_items')->default(0);
            
            // Additional Details
            $table->text('receipt_remarks')->nullable();
            $table->text('notes')->nullable();
            $table->text('vendor_remarks')->nullable();
            
            // Document Details
            $table->string('grn_document_path')->nullable(); // Path to generated PDF
            $table->string('inspection_report_path')->nullable();
            $table->string('return_document_path')->nullable();
            
            // Refractory-specific quality check fields
            $table->json('temperature_resistance_test')->nullable();
            $table->json('chemical_composition_test')->nullable();
            $table->json('physical_properties_test')->nullable();
            $table->json('dimensional_accuracy_test')->nullable();
            $table->json('visual_inspection_results')->nullable();
            $table->json('quality_certification_verification')->nullable();
            $table->json('batch_consistency_check')->nullable();
            $table->json('storage_condition_verification')->nullable();
            
            // Test Environment Details
            $table->decimal('test_temperature', 10, 2)->nullable();
            $table->decimal('test_pressure', 10, 2)->nullable();
            $table->integer('test_duration')->nullable();
            $table->string('test_environment')->nullable();
            $table->string('test_equipment_used')->nullable();
            $table->string('test_operator')->nullable();
            $table->text('test_remarks')->nullable();
            
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
        Schema::dropIfExists('goods_receipt_notes');
    }
};
