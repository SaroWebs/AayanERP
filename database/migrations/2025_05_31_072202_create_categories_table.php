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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->integer('sort_order')->default(0);
            
            // Refractory-specific fields
            $table->json('technical_requirements')->nullable();
            $table->json('application_areas')->nullable();
            $table->json('quality_standards')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            // Add foreign key constraint for parent_id
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('categories')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
