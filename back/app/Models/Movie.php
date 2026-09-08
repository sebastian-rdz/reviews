<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    /** @use HasFactory<\Database\Factories\MovieFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'director',
        'release_year',
        'tmdb_id',
        'poster_path',
        'poster_url',
        'backdrop_path',
        'backdrop_url',
        'overview',
        'runtime',
        'genres',
        'cast_list',
        'tmdb_rating',
        'favorite',
    ];

    protected $casts = [
        'favorite' => 'boolean',
        'genres' => 'array',
        'cast_list' => 'array',
        'runtime' => 'integer',
        'tmdb_rating' => 'float',
    ];

    protected $appends = ['decade'];

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function watchlistItem()
    {
        return $this->hasOne(WatchlistItem::class);
    }

    public function getDecadeAttribute(): ?int
    {
        return $this->release_year ? (int) (floor($this->release_year / 10) * 10) : null;
    }
}
