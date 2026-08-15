<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_number',
        'user_id',
        'service_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'message',
        'estimated_amount',
        'status',
        'valid_until',
        'status_flag',
    ];

    protected function casts(): array
    {
        return [
            'estimated_amount' => 'decimal:2',
            'valid_until' => 'datetime',
            'status_flag' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Quote $quote) {
            if (empty($quote->quote_number)) {
                $quote->quote_number = 'QT-'.strtoupper(Str::random(8));
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
