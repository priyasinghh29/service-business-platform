<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('priority')->default('Medium')->after('type'); // Low|Medium|High
            $table->string('action_label')->nullable()->after('link');
            $table->boolean('action_required')->default(false)->after('action_label');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn(['priority', 'action_label', 'action_required']);
        });
    }
};
