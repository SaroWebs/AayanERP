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
        Schema::create('emp_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('category', [
                'passport',
                'pan_card',
                'gst_certificate',
                'identity_proof',
                'address_proof',
                'bank_documents',
                'registration_documents',
                'invoice',
                'quotation',
                'other'
            ])->default('other');
            $table->string('name');
            $table->string('number')->nullable();
            $table->string('type')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('sharing_option', ['public', 'private'])->default('public');
            $table->string('issued_by')->nullable();
            $table->date('issued_date')->nullable();
            $table->string('document_url');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emp_documents');
    }
};
