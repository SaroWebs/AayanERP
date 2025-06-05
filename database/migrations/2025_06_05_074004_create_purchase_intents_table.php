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
        Schema::create('purchase_intents', function (Blueprint $table) {
            $table->id();
            $table->string('intent_no')->unique(); // Auto-generated unique intent number
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            
            // Intent Details
            $table->string('subject');
            $table->text('description')->nullable();
            $table->enum('type', ['equipment', 'scaffolding', 'spares', 'consumables', 'other'])->default('equipment');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', [
                'draft',           // Initial draft state
                'pending_review',  // Waiting for review
                'pending_approval', // Waiting for management approval
                'approved',        // Approved by management
                'converted',       // Converted to purchase order
                'rejected',        // Rejected
                'cancelled'        // Cancelled intent
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
            $table->date('intent_date');
            $table->date('required_date')->nullable();
            $table->date('converted_date')->nullable();
            
            // Financial Details
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->string('currency', 3)->default('INR');
            $table->text('budget_details')->nullable();
            
            // Additional Details
            $table->text('justification')->nullable();
            $table->text('specifications')->nullable();
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            
            // Document Details
            $table->string('document_path')->nullable(); // Path to generated PDF
            $table->string('specification_document_path')->nullable();
            
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
        Schema::dropIfExists('purchase_intents');
    }
};
