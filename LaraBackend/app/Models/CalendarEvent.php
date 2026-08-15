<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'booking_id',
        'title',
        'type',
        'event_date',
        'event_time',
        'with_name',
        'mode',
        'priority',
        'rsvp_status',
        'notes',
        'status_flag',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
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
