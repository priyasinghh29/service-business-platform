<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SupportArticle extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'content',
        'reads',
        'is_faq',
        'faq_answer',
        'status',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'reads' => 'integer',
            'is_faq' => 'boolean',
            'status' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (SupportArticle $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title) ?: 'article-'.Str::random(6);
            }
        });
    }
}
