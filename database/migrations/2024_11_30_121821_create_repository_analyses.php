<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('repository_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('repository_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->longText('content');
            $table->json('analysis');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('repository_analyses');
    }
};
