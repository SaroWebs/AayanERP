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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->morphs('movable'); // This automatically creates movable_type, movable_id and their index
            $table->enum('type', ['in', 'out', 'transfer', 'adjustment', 'return', 'damage'])->default('in');
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total_value', 10, 2)->nullable();
            
            // Location tracking
            $table->string('from_location')->nullable();
            $table->string('to_location')->nullable();
            
            // Reference information
            $table->string('reference_type')->nullable(); // e.g., 'purchase', 'sale', 'maintenance', etc.
            $table->string('reference_id')->nullable(); // ID of the related document
            $table->string('reference_number')->nullable(); // Document number for easy reference
            
            // Movement details
            $table->date('movement_date');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            
            // Tracking
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, cancelled
            
            $table->timestamps();
            $table->softDeletes();
            
            // Additional indexes for better performance
            $table->index('movement_date');
            $table->index('reference_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
}; 