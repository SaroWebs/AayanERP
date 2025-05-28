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
        Schema::create('employee_spouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('spouse_name')->nullable();
            $table->date('spouse_dob')->nullable();
            $table->string('spouse_telephone')->nullable();
            $table->string('spouse_qualification')->nullable();
            $table->date('marriage_date')->nullable();
            $table->text('spouse_job_details')->nullable();
            $table->enum('mother_tongue', ['hindi', 'english', 'assamese', 'bengali', 'other'])->nullable()->default('other');
            $table->enum('religion', ['hindu', 'muslim', 'christian', 'jain', 'buddhist', 'other'])->nullable()->default('other');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_spouses');
    }
};
