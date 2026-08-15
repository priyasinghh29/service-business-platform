<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('detail')->nullable();
            $table->string('type')->default('card'); // card|bank|upi
            $table->boolean('is_primary')->default(false);
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('cadence')->default('Monthly');
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status')->default('active'); // active|paused|cancelled
            $table->timestamp('renews_at')->nullable();
            $table->boolean('status_flag')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('payment_methods');
    }
};
