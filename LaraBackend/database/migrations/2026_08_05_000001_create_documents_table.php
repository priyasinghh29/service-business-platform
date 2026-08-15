<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('folder')->nullable()->default('General');
            $table->string('file_path')->nullable();
            $table->string('file_type')->nullable(); // pdf|doc|xls|img|other
            $table->unsignedBigInteger('file_size')->nullable(); // bytes
            $table->string('uploaded_by')->nullable();
            $table->string('status')->default('available'); // available|pending|requested
            $table->timestamp('due_at')->nullable();
            $table->boolean('status_flag')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
