<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

/**
 * Thin helper around the TMDB API. Returns normalised Movie attributes so the
 * controllers never have to know the TMDB response shape.
 */
class Tmdb
{
    public const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

    public const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

    public const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

    public static function configured(): bool
    {
        return (bool) config('services.tmdb.key');
    }

    /**
     * @return array<int, array<string, mixed>> Search results, already normalised.
     */
    public static function search(string $query): array
    {
        if (! self::configured()) {
            return [];
        }

        $res = Http::get('https://api.themoviedb.org/3/search/movie', [
            'api_key' => config('services.tmdb.key'),
            'query' => $query,
            'page' => 1,
        ]);

        if ($res->failed()) {
            return [];
        }

        return array_values(array_map(function ($r) {
            return [
                'tmdb_id' => $r['id'] ?? null,
                'title' => $r['title'] ?? ($r['name'] ?? ''),
                'release_year' => ! empty($r['release_date']) ? (int) substr($r['release_date'], 0, 4) : null,
                'release_date' => $r['release_date'] ?? null,
                'overview' => $r['overview'] ?? null,
                'poster_path' => $r['poster_path'] ?? null,
                'poster_url' => ! empty($r['poster_path']) ? self::POSTER_BASE.$r['poster_path'] : null,
            ];
        }, $res->json('results') ?? []));
    }

    /**
     * Fetch a single movie (with credits) and map it to Movie attributes.
     * Returns null when TMDB is unreachable or unconfigured.
     */
    public static function movie(int $tmdbId): ?array
    {
        if (! self::configured()) {
            return null;
        }

        $res = Http::get("https://api.themoviedb.org/3/movie/{$tmdbId}", [
            'api_key' => config('services.tmdb.key'),
            'append_to_response' => 'credits',
        ]);

        if (! $res->ok()) {
            return null;
        }

        $data = $res->json();

        $director = '';
        foreach ($data['credits']['crew'] ?? [] as $crew) {
            if (($crew['job'] ?? '') === 'Director') {
                $director = $crew['name'];
                break;
            }
        }

        $cast = [];
        foreach (array_slice($data['credits']['cast'] ?? [], 0, 12) as $c) {
            $cast[] = [
                'name' => $c['name'] ?? '',
                'character' => $c['character'] ?? null,
                'profile_url' => ! empty($c['profile_path']) ? self::PROFILE_BASE.$c['profile_path'] : null,
            ];
        }

        $posterPath = $data['poster_path'] ?? null;
        $backdropPath = $data['backdrop_path'] ?? null;

        return [
            'tmdb_id' => $tmdbId,
            'name' => $data['title'] ?? ($data['name'] ?? ''),
            'release_year' => ! empty($data['release_date']) ? (int) substr($data['release_date'], 0, 4) : null,
            'director' => $director,
            'overview' => $data['overview'] ?? null,
            'runtime' => $data['runtime'] ?? null,
            'genres' => array_values(array_map(fn ($g) => $g['name'], $data['genres'] ?? [])),
            'cast_list' => $cast,
            'tmdb_rating' => isset($data['vote_average']) ? round((float) $data['vote_average'], 1) : null,
            'poster_path' => $posterPath,
            'poster_url' => $posterPath ? self::POSTER_BASE.$posterPath : null,
            'backdrop_path' => $backdropPath,
            'backdrop_url' => $backdropPath ? self::BACKDROP_BASE.$backdropPath : null,
        ];
    }
}
