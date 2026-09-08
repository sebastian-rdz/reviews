<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Support\Tmdb;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function index()
    {
        return response()->json(Movie::all());
    }

    public function favorites()
    {
        $movies = Movie::where('favorite', true)
            ->orderByDesc('id')
            ->take(5)
            ->get();

        return response()->json($movies);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'director' => 'required|string',
            'release_year' => 'required|integer|min:1870|max:'.(date('Y') + 5),
            'poster_path' => 'nullable|string',
            'poster_url' => 'nullable|url',
        ]);

        if (empty($validated['poster_url']) && ! empty($validated['poster_path'])) {
            $validated['poster_url'] = Tmdb::POSTER_BASE.'/'.ltrim($validated['poster_path'], '/');
        }

        $movie = Movie::create($validated);

        return response()->json($movie, 201);
    }

    public function search(Request $request)
    {
        $request->validate(['query' => 'required|string']);
        $query = $request->input('query');

        if (Tmdb::configured()) {
            return response()->json(Tmdb::search($query));
        }

        // No TMDB key — fall back to searching films already in the library so the
        // app stays usable offline.
        $local = Movie::query()
            ->where('name', 'like', "%{$query}%")
            ->orderBy('name')
            ->limit(20)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'tmdb_id' => $m->tmdb_id,
                'title' => $m->name,
                'name' => $m->name,
                'director' => $m->director,
                'release_year' => $m->release_year,
                'poster_path' => $m->poster_path,
                'poster_url' => $m->poster_url,
                'local' => true,
            ]);

        return response()->json($local->values());
    }

    public function createFromTMDB(Request $request)
    {
        $request->validate(['tmdb_id' => 'required|integer']);
        $tmdbId = (int) $request->input('tmdb_id');

        $attrs = Tmdb::movie($tmdbId);
        if ($attrs === null) {
            return response()->json(['error' => 'TMDB movie request failed'], 404);
        }

        $movie = Movie::updateOrCreate(['tmdb_id' => $tmdbId], $attrs);

        return response()->json($movie, $movie->wasRecentlyCreated ? 201 : 200);
    }

    public function show($id)
    {
        $movie = Movie::findOrFail($id);

        // Lazily enrich records created before the detail fields existed.
        if ($movie->tmdb_id && ($movie->overview === null || $movie->runtime === null || $movie->backdrop_url === null)) {
            if ($attrs = Tmdb::movie((int) $movie->tmdb_id)) {
                $movie->fill($attrs)->save();
            }
        }

        $reviews = $movie->reviews()
            ->orderByRaw('COALESCE(watched_on, date(created_at)) DESC')
            ->orderByDesc('id')
            ->get();

        $rated = $reviews->whereNotNull('rating');

        return response()->json([
            'movie' => $movie,
            'reviews' => $reviews->values(),
            'in_watchlist' => $movie->watchlistItem()->exists(),
            'stats' => [
                'times_logged' => $reviews->count(),
                'average_rating' => $rated->count() ? round($rated->avg('rating'), 2) : null,
                'liked' => (bool) $reviews->firstWhere('liked', true),
                'first_watched' => optional($reviews->last())->watched_on,
                'last_watched' => optional($reviews->first())->watched_on,
            ],
        ]);
    }
}
