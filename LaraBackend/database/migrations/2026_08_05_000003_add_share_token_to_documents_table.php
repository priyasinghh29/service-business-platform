<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (! Schema::hasColumn('documents', 'share_token')) {
                $table->string('share_token', 64)->nullable()->unique()->after('due_at');
            }
            if (! Schema::hasColumn('documents', 'shared_at')) {
                $table->timestamp('shared_at')->nullable()->after('share_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            if (Schema::hasColumn('documents', 'shared_at')) {
                $table->dropColumn('shared_at');
            }
            if (Schema::hasColumn('documents', 'share_token')) {
                $table->dropColumn('share_token');
            }
        });
    }
};
