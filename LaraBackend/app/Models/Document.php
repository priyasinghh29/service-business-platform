<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'booking_id',
        'name',
        'folder',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by',
        'status',
        'due_at',
        'share_token',
        'shared_at',
        'status_flag',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'due_at' => 'datetime',
            'shared_at' => 'datetime',
            'status_flag' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
