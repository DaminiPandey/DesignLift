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
        Schema::table('users', function (Blueprint $table) {
            // Add github_token and github_username columns
            $table->string('github_token')->nullable()->after('email'); // after email column
            $table->string('github_username')->nullable()->after('github_token'); // after github_token column
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop github_token and github_username columns
            $table->dropColumn('github_token');
            $table->dropColumn('github_username');
        });
    }
};
