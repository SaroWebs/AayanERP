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
        Schema::create('dispatches', function (Blueprint $table) {
            $table->id();
            $table->string('dispatch_no')->unique(); // Auto-generated unique dispatch number
            $table->foreignId('sales_order_id')->constrained('sales_orders')->cascadeOnDelete();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('client_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dispatched_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Dispatch Details
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'ready',          // Ready for dispatch
                'in_transit',     // Equipment in transit
                'delivered',      // Delivered to client
                'returned',       // Equipment returned
                'cancelled'       // Dispatch cancelled
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
            $table->date('dispatch_date');
            $table->date('expected_delivery_date')->nullable();
            $table->date('actual_delivery_date')->nullable();
            $table->date('return_date')->nullable();
            
            // Equipment Details
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->enum('rental_period_unit', ['hours', 'days', 'months', 'years'])->default('days');
            $table->integer('rental_period')->nullable();
            
            // Transport Details
            $table->enum('transport_mode', [
                'road',           // Road transport
                'rail',           // Rail transport
                'air',            // Air transport
                'sea',            // Sea transport
                'self_transport'  // Client's own transport
            ])->default('road');
            
            $table->string('transporter_name')->nullable();
            $table->string('vehicle_number')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();
            $table->string('lr_number')->nullable(); // Lorry Receipt number
            $table->date('lr_date')->nullable();
            $table->decimal('transport_charges', 12, 2)->default(0);
            $table->text('transport_remarks')->nullable();
            
            // Delivery Details
            $table->string('delivery_state')->nullable();
            $table->string('delivery_address')->nullable();
            $table->string('delivery_contact_person')->nullable();
            $table->string('delivery_contact_phone')->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->text('site_details')->nullable();
            
            // Equipment Condition
            $table->enum('dispatch_condition', ['good', 'fair', 'poor'])->default('good');
            $table->text('dispatch_remarks')->nullable();
            $table->enum('return_condition', ['good', 'fair', 'poor'])->nullable();
            $table->text('return_remarks')->nullable();
            $table->text('damage_details')->nullable();
            
            // Checklist
            $table->boolean('safety_check_done')->default(false);
            $table->boolean('operational_check_done')->default(false);
            $table->boolean('documentation_complete')->default(false);
            $table->text('checklist_remarks')->nullable();
            
            // Documents
            $table->string('dispatch_challan_path')->nullable();
            $table->string('delivery_receipt_path')->nullable();
            $table->string('return_challan_path')->nullable();
            $table->string('damage_report_path')->nullable();
            
            // Additional Details
            $table->text('special_instructions')->nullable();
            $table->text('notes')->nullable();
            $table->text('client_remarks')->nullable();
            
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
        Schema::dropIfExists('dispatches');
    }
};
