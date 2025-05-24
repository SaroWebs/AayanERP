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
        Schema::create('emp_service_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('period_leave_allocation')->nullable();
            $table->text('leave_details')->nullable();
            $table->string('warning_letter')->nullable();
            $table->text('warning_subject')->nullable();
            $table->string('warning_issued_by')->nullable();
            $table->date('termination_date')->nullable();
            $table->enum('termination_type', ['termination', 'promotion', 'transfer', 'dismissal', 'resignation', 'other'])->nullable();
            $table->text('termination_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emp_service_details');
    }
};
