<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Schema::table('notifications', function (Blueprint $table) {
       // $table->unsignedBigInteger('employee_id')->nullable()->after('id');
      //  $table->foreign('employee_id')->references('id')->on('employees')->onDelete('cascade');
    
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type')->default('general');
            $table->boolean('is_read')->default(false);
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'is_read']);
            $table->index(['related_id', 'related_type']);
        });
    }


    public function down()
    {

        Schema::table('notifications', function (Blueprint $table) {
        $table->dropForeign(['employee_id']);
        $table->dropColumn('employee_id');
    });
      //  Schema::dropIfExists('notifications');
    }
};
