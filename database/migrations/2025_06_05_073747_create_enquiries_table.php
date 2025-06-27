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
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('enquiry_no')->unique(); // Auto-generated unique enquiry number
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->foreignId('contact_person_id')->nullable()->constrained('client_contact_details')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('referred_by')->nullable()->constrained('employees')->nullOnDelete();
            
            // Enquiry Details
            $table->string('subject')->nullable();
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Status Management
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for initial review
                'under_review',    // Being reviewed by sales team
                'quoted',          // Quotation prepared
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'converted',       // Converted to sales order
                'lost',           // Lost opportunity
                'cancelled'        // Cancelled enquiry
            ])->default('draft');
            
            // Management Approval Status
            $table->enum('approval_status', [
                'pending',         // Waiting for approval
                'approved',        // Approved
                'rejected',        // Rejected
                'not_required'     // No approval needed
            ])->default('not_required');
            
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_remarks')->nullable();
            
            $table->enum('source', ['website', 'email', 'phone', 'referral', 'walk_in', 'other'])->default('other');
            
            // Location Details
            $table->string('deployment_state')->nullable();
            $table->string('location')->nullable();
            $table->text('site_details')->nullable();
            
            // Dates
            $table->date('enquiry_date');
            $table->date('required_date')->nullable();
            $table->date('valid_until')->nullable();
            $table->date('converted_date')->nullable();
            
            // Financial Details
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->string('currency', 3)->default('INR');
            
            // Follow-up
            $table->date('next_follow_up_date')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->text('special_requirements')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
