<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WatchlistItem extends Model
{
    protected $table = 'watchlist_items';

    protected $fillable = [
        'movie_id',
        'note',
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
}
