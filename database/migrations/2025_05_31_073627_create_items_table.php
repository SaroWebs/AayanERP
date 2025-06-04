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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('hsn')->nullable();
            $table->text('description_1')->nullable();
            $table->text('description_2')->nullable();
            $table->enum('unit', ['set', 'nos', 'rmt', 'sqm', 'ltr', 'na'])->nullable();
            $table->enum('applicable_for', ['all', 'equipment', 'scaffolding'])->default('all');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('minimum_stock')->default(0);
            $table->integer('current_stock')->default(0);
            $table->integer('maximum_stock')->nullable();
            $table->integer('reorder_point')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
