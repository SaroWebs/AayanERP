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
        Schema::create('client_contact_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_detail_id')->constrained('client_details')->cascadeOnDelete();
            $table->string('contact_person');
            $table->string('department')->nullable();
            $table->string('designation')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_contact_details');
    }
};
