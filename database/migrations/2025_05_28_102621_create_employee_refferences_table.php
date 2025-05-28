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
        Schema::create('employee_refferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
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
        Schema::dropIfExists('employee_refferences');
    }
};
