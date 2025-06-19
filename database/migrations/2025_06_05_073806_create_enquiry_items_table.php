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
        Schema::create('enquiry_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained('enquiries')->cascadeOnDelete();
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->enum('nature_of_work', [
                'soil', 'rock', 'limestone', 'coal', 'sand', 'gravel', 
                'construction', 'demolition', 'mining', 'quarry', 'other'
            ])->default('other');
            $table->integer('duration')->nullable();
            $table->enum('duration_unit', ['hours', 'days', 'months', 'years'])->default('days');
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enquiry_items');
    }
};
