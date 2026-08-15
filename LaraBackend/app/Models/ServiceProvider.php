<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'bio',
        'specialization',
        'hourly_rate',
        'availability',
        'rating_avg',
        'rating_count',
        'is_verified',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'hourly_rate' => 'decimal:2',
            'availability' => 'array',
            'rating_avg' => 'decimal:2',
            'rating_count' => 'integer',
            'is_verified' => 'boolean',
            'status' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'provider_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'provider_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
