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
        Schema::create('equipment_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->string('part_number')->nullable();
            $table->string('location_in_equipment')->nullable();
            $table->integer('quantity_required')->default(1);
            $table->boolean('is_critical')->default(false);
            $table->text('installation_instructions')->nullable();
            $table->text('maintenance_instructions')->nullable();
            $table->json('specifications')->nullable();
            $table->date('last_replacement_date')->nullable();
            $table->integer('replacement_interval_hours')->nullable();
            $table->integer('next_replacement_hours')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Unique constraint to prevent duplicate parts
            $table->unique(['item_id', 'part_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_parts');
    }
}; 