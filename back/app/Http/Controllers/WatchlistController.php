<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\WatchlistItem;
use App\Support\Tmdb;
use Illuminate\Http\Request;

class WatchlistController extends Controller
{
    public function index()
    {
        $items = WatchlistItem::with('movie')
            ->orderByDesc('id')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'movie_id' => 'required_without:tmdb_id|nullable|exists:movies,id',
            'tmdb_id' => 'required_without:movie_id|nullable|integer',
            'note' => 'nullable|string',
        ]);

        $movieId = $data['movie_id'] ?? null;

        if (! $movieId && ! empty($data['tmdb_id'])) {
            $movie = Movie::where('tmdb_id', $data['tmdb_id'])->first();

            if (! $movie) {
                $attrs = Tmdb::movie((int) $data['tmdb_id']);
                if (! $attrs) {
                    return response()->json(['error' => 'Could not resolve movie from TMDB'], 422);
                }
                $movie = Movie::updateOrCreate(['tmdb_id' => (int) $data['tmdb_id']], $attrs);
            }

            $movieId = $movie->id;
        }

        $item = WatchlistItem::updateOrCreate(
            ['movie_id' => $movieId],
            ['note' => $data['note'] ?? null]
        );

        return response()->json($item->load('movie'), $item->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy($movieId)
    {
        WatchlistItem::where('movie_id', $movieId)->delete();

        return response()->json(['removed' => true]);
    }
}
