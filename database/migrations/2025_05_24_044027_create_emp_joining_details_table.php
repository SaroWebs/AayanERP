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
        Schema::create('emp_joining_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('joining_date');
            $table->enum('category', [
                'technical_staff',
                'non_technical_staff',
                'supporting_staff',
                'other'
            ])->default('other');
            $table->enum('appointment_type', [
                'permanent',
                'temporary',
                'contractual',
                'probation'
            ])->default('probation');
            $table->string('employee_id_number')->unique();
            $table->string('department');
            $table->string('designation');
            $table->string('reporting_to')->nullable();
            $table->string('work_location');
            $table->string('photo_url');
            $table->date('probation_end_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->text('joining_remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emp_joining_details');
    }
};
