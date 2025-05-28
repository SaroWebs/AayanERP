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
        Schema::create('client_details', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_no', 20);
            $table->string('email')->nullable();
            $table->string('gstin_no', 15)->nullable();
            $table->string('pan_no', 10)->nullable();
            $table->string('fax', 20)->nullable();
            $table->string('state')->nullable();
            $table->text('address')->nullable();
            $table->text('correspondence_address')->nullable();
            $table->enum('company_type', ['regional', 'national', 'government'])->default('regional');
            $table->decimal('turnover', 10, 2);
            $table->enum('range', ['state', 'central', 'NA'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_details');
    }
};
