<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    /** @use HasFactory<\Database\Factories\ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'movie_id',
        'rating',
        'watched_on',
        'liked',
        'rewatch',
        'comment',
    ];

    protected $casts = [
        'rating' => 'float',
        'watched_on' => 'date:Y-m-d',
        'liked' => 'boolean',
        'rewatch' => 'boolean',
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
