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
        Schema::create('emp_other_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('spouse_name')->nullable();
            $table->date('spouse_dob')->nullable();
            $table->string('spouse_telephone')->nullable();
            $table->string('spouse_qualification')->nullable();
            $table->date('marriage_date')->nullable();
            $table->enum('mother_tongue', ['hindi', 'english', 'assamese', 'bengali', 'other'])->nullable()->default('other');
            $table->enum('religion', ['hindu', 'muslim', 'christian', 'jain', 'buddhist', 'other'])->nullable()->default('other');
            $table->text('spouse_job_details')->nullable();
            $table->string('children_name')->nullable();
            $table->date('children_dob')->nullable();
            $table->enum('children_gender', ['male', 'female', 'other'])->nullable()->default('other');
            $table->string('qualification')->nullable();
            $table->string('event_name')->nullable();
            $table->string('discipline')->nullable();
            $table->string('prize_awarded')->nullable();
            $table->date('event_year')->nullable();
            $table->string('other_details')->nullable();
            $table->string('training_name')->nullable();
            $table->string('training_place')->nullable();
            $table->string('organized_by')->nullable();
            $table->date('training_start_date')->nullable();
            $table->date('training_end_date')->nullable();
            $table->string('language_name')->nullable();
            $table->enum('can_speak', ['yes', 'no'])->nullable()->default('no');
            $table->enum('can_read', ['yes', 'no'])->nullable()->default('no');
            $table->enum('can_write', ['yes', 'no'])->nullable()->default('no');
            $table->string('nominee_name')->nullable();
            $table->enum('nominee_relationship', ['father', 'mother', 'brother', 'sister', 'son', 'daughter', 'husband', 'wife', 'other'])->nullable()->default('other');
            $table->date('nominee_dob')->nullable();
            $table->integer('share_percentage')->nullable();
            $table->string('reference_name')->nullable();
            $table->enum('designation', [
                'senior_manager_maintenance',
                'assistant_manager_business_development',
                'project_coordinator',
                'general_manager_production',
                'executive_fa',
                'associate_business_development',
                'store_incharge',
                'trainee_engineer',
                'trainee_engineer_civil',
                'store_assistant',
                'assistant_manager_hr',
                'supervisor',
                'store_assistant_jr',
                'store_keeper_wb_operator',
                'operator_weigh_bridge',
                'operator_weigh_bridge_marketing',
                'foreman_lathe',
                'technician_jr_lathe',
                'supervisor_civil',
                'supervisor_greasing',
                'fitter',
                'welder',
                'denter',
                'sr_mechanic',
                'mechanic',
                'auto_electrician',
                'electrician',
                'jr_electrician',
                'operator_hydra',
                'operator_excavator',
                'operator_jcb',
                'operator_loader',
                'operator_dozer',
                'operator_grader',
                'operator_compactor',
                'operator_roller',
                'operator_bm_roller',
                'operator_paver',
                'operator_batching_plant',
                'crane_operator_technician',
                'driver_tm',
                'driver_hmv',
                'driver_trailer_volvo',
                'driver_trailer_low_bed',
                'tyre_fitter',
                'cook',
                'operator_concrete_pump',
                'operator_slm',
                'operator_boom_placer',
                'mechanic_sr',
                'painter',
                'crane_operator'
            ])->nullable();
            $table->string('reference_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emp_other_details');
    }
};
