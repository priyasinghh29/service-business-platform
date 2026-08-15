<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('type'); // meeting|deadline|rsvp
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->string('with_name')->nullable();
            $table->string('mode')->nullable(); // Video Call|Phone Call|In Person|Workshop
            $table->string('priority')->nullable(); // Low|Medium|High
            $table->string('rsvp_status')->nullable(); // pending|accepted|declined
            $table->text('notes')->nullable();
            $table->boolean('status_flag')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'event_date']);
            $table->index(['user_id', 'type']);
        });

        Schema::create('calendar_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider'); // google|outlook|apple
            $table->string('name');
            $table->boolean('connected')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_integrations');
        Schema::dropIfExists('calendar_events');
    }
};
