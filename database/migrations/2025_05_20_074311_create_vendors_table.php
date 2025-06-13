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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // Vendor code for easy reference
            $table->string('type')->default('supplier'); // supplier, manufacturer, service_provider, etc.
            $table->string('status')->default('active');
            
            // Contact Information
            $table->string('contact_no')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('fax')->nullable();
            
            // Business Information
            $table->string('gstin')->nullable();
            $table->string('pan_no')->nullable();
            $table->string('cin')->nullable(); // Company Identification Number
            $table->string('business_type')->nullable(); // Proprietorship, Partnership, Pvt Ltd, etc.
            $table->string('industry_type')->nullable();
            $table->string('tax_registration_type')->nullable();
            
            // Address Information
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('pincode')->nullable();
            
            // Bank Details
            $table->string('bank_name')->nullable();
            $table->string('bank_branch')->nullable();
            $table->string('bank_account_no')->nullable();
            $table->string('bank_ifsc_code')->nullable();
            
            // Additional Information
            $table->text('payment_terms')->nullable();
            $table->text('delivery_terms')->nullable();
            $table->text('warranty_terms')->nullable();
            $table->text('quality_standards')->nullable();
            $table->text('certifications')->nullable();
            $table->text('specializations')->nullable();
            $table->text('notes')->nullable();
            
            // Rating and Performance
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('performance_score')->nullable();
            $table->date('last_order_date')->nullable();
            $table->date('last_payment_date')->nullable();
            
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
        Schema::dropIfExists('vendors');
    }
};
