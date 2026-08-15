<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'actor_id',
        'type',
        'priority',
        'title',
        'message',
        'link',
        'action_label',
        'action_required',
        'read',
    ];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
            'action_required' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
