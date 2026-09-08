<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->query('year', now()->year);

        // Light projection: only the columns the aggregates need, never comments.
        $rows = Review::query()
            ->join('movies', 'movies.id', '=', 'reviews.movie_id')
            ->selectRaw('reviews.rating as rating')
            ->selectRaw('reviews.liked as liked')
            ->selectRaw('COALESCE(reviews.watched_on, date(reviews.created_at)) as watched_on')
            ->selectRaw('reviews.movie_id as movie_id')
            ->selectRaw('movies.release_year as release_year')
            ->selectRaw('movies.runtime as runtime')
            ->selectRaw('movies.director as director')
            ->selectRaw('movies.genres as genres')
            ->get();

        if ($rows->isEmpty()) {
            return response()->json([
                'has_data' => false,
                'year' => $year,
            ]);
        }

        $ratings = $rows->pluck('rating')->filter(fn ($r) => $r !== null);
        $inYear = $rows->filter(fn ($r) => $r->watched_on && Carbon::parse($r->watched_on)->year === $year);

        // Rating distribution in half-star buckets.
        $distribution = [];
        for ($v = 0.5; $v <= 5.0; $v += 0.5) {
            $key = number_format($v, 1);
            $distribution[$key] = $ratings->filter(fn ($r) => number_format((float) $r, 1) === $key)->count();
        }

        // By decade.
        $byDecade = $rows
            ->filter(fn ($r) => $r->release_year)
            ->groupBy(fn ($r) => (int) (floor($r->release_year / 10) * 10))
            ->map->count()
            ->sortKeys();

        // By genre (genres is a JSON array stored as text).
        $genreCounts = [];
        foreach ($rows as $r) {
            foreach ((json_decode($r->genres ?? '[]', true) ?: []) as $g) {
                $genreCounts[$g] = ($genreCounts[$g] ?? 0) + 1;
            }
        }
        arsort($genreCounts);

        // Top directors.
        $directorCounts = $rows
            ->filter(fn ($r) => $r->director)
            ->groupBy('director')
            ->map->count()
            ->sortDesc()
            ->take(6);

        // Logs per month for the selected year.
        $perMonth = [];
        for ($m = 1; $m <= 12; $m++) {
            $perMonth[$m] = $inYear->filter(fn ($r) => Carbon::parse($r->watched_on)->month === $m)->count();
        }

        $watchedDates = $rows->pluck('watched_on')->filter()->sort()->values();
        $totalMinutes = $rows->sum(fn ($r) => (int) $r->runtime);

        return response()->json([
            'has_data' => true,
            'year' => $year,
            'totals' => [
                'films' => $rows->pluck('movie_id')->unique()->count(),
                'logs' => $rows->count(),
                'this_year' => $inYear->count(),
                'liked' => $rows->where('liked', true)->count(),
                'average_rating' => $ratings->count() ? round($ratings->avg(), 2) : null,
                'hours' => round($totalMinutes / 60),
                'rewatches' => $rows->count() - $rows->pluck('movie_id')->unique()->count(),
            ],
            'rating_distribution' => $distribution,
            'by_decade' => $byDecade,
            'by_genre' => array_slice(
                array_map(fn ($g, $c) => ['genre' => $g, 'count' => $c], array_keys($genreCounts), array_values($genreCounts)),
                0,
                8
            ),
            'top_directors' => $directorCounts->map(fn ($count, $name) => ['director' => $name, 'count' => $count])->values(),
            'per_month' => $perMonth,
            'first_log' => $watchedDates->first(),
            'last_log' => $watchedDates->last(),
        ]);
    }
}
