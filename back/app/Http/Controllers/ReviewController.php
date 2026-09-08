<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 15);
        $perPage = min(max($perPage, 1), 10000); // 1..10000 ("show all")

        $query = $this->filtered($request);

        switch ($request->query('sort_by', 'newest')) {
            case 'rating':
                $query->orderByDesc('rating')->orderByDesc('id');
                break;
            case 'watched':
                $query->orderByRaw('COALESCE(watched_on, date(created_at)) DESC')->orderByDesc('id');
                break;
            default:
                $query->orderByDesc('created_at');
        }

        return response()->json($query->paginate($perPage));
    }

    /**
     * Flat, chronological feed for the diary view — ordered by the day the
     * film was watched. The frontend groups it by month.
     */
    public function diary(Request $request)
    {
        $reviews = $this->filtered($request)
            ->orderByRaw('COALESCE(watched_on, date(created_at)) DESC')
            ->orderByDesc('id')
            ->limit(2000)
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'rating' => 'required|numeric|min:0|max:5',
            'comment' => 'nullable|string',
            'watched_on' => 'nullable|date',
            'liked' => 'sometimes|boolean',
            'favorite' => 'sometimes|boolean',
        ]);

        $watchedOn = $data['watched_on'] ?? now()->toDateString();

        // A log is a rewatch when this movie already has an earlier one.
        $isRewatch = Review::where('movie_id', $data['movie_id'])->exists();

        $review = Review::create([
            'movie_id' => $data['movie_id'],
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'watched_on' => $watchedOn,
            'liked' => $data['liked'] ?? false,
            'rewatch' => $isRewatch,
        ]);

        // "Favorite" lives on the movie (drives the Favorite films shelf).
        if (array_key_exists('favorite', $data)) {
            Movie::whereKey($data['movie_id'])->update(['favorite' => $data['favorite']]);
        }

        return response()->json($review->load('movie'), 201);
    }

    public function show($id)
    {
        return response()->json(Review::with('movie')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'rating' => 'sometimes|numeric|min:0|max:5',
            'comment' => 'sometimes|nullable|string',
            'watched_on' => 'sometimes|nullable|date',
            'liked' => 'sometimes|boolean',
        ]);

        $review = Review::findOrFail($id);
        $review->update($data);

        return response()->json($review->load('movie'));
    }

    public function destroy($id)
    {
        Review::findOrFail($id)->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Shared filtering used by both the paginated list and the diary feed.
     */
    private function filtered(Request $request)
    {
        $query = Review::with('movie');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->whereHas('movie', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('director', 'like', "%{$search}%");
            });
        }

        if ($request->filled('min_rating') && $request->query('min_rating') > 0) {
            $query->where('rating', '>=', $request->query('min_rating'));
        }

        if ($request->filled('year') && $request->query('year') !== 'all') {
            $query->whereHas('movie', fn ($q) => $q->where('release_year', $request->query('year')));
        }

        if ($request->filled('genre') && $request->query('genre') !== 'all') {
            $genre = $request->query('genre');
            $query->whereHas('movie', fn ($q) => $q->where('genres', 'like', '%"'.$genre.'"%'));
        }

        if ($request->boolean('liked')) {
            $query->where('liked', true);
        }

        return $query;
    }
}
