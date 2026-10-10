<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');
            $table->integer('allocated_days');
            $table->integer('used_days')->default(0);
            $table->integer('remaining_days');
            $table->year('year');
            $table->timestamps();
            
            $table->unique(['employee_id', 'leave_type_id', 'year']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('leave_balances');
    }
};
