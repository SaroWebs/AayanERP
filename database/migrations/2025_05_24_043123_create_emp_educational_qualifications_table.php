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
        Schema::create('emp_educational_qualifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('qualification', [
                'hslc',
                'hsslc',
                'ba',
                'bsc',
                'bcom',
                'bed',
                'ma',
                'msc',
                'mcom',
                'mphil',
                'med',
                'other'
            ])->default('other');
            $table->year('passing_year')->nullable();
            $table->string('institution_name')->nullable();
            $table->string('board_university')->nullable();
            $table->date('completion_date')->nullable();
            $table->string('subject')->nullable();
            $table->string('medium')->nullable();
            $table->decimal('marks_percentage', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emp_educational_qualifications');
    }
};
