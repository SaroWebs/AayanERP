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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('pf_no')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender',['male', 'female','other'])->default('male');
            $table->enum('blood_group',['A+', 'A-','B+','B-','AB+','AB-','O+','O-'])->nullable();
            $table->string('pan_no')->nullable();
            $table->string('aadhar_no')->nullable();
            $table->string('guardian_name')->nullable();
            $table->integer('contact_no')->nullable();
            $table->string('email')->nullable();
            $table->string('country')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
