<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\Review;
use App\Models\WatchlistItem;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $byTmdb = fn ($id) => Movie::where('tmdb_id', $id)->value('id');

        // [tmdb_id, rating, watched_on, liked, comment]
        $logs = [
            [666277, 4.5, '2026-08-14', true, "Devastatingly tender. The final walk to the car wrecked me.\nA film that keeps unfolding days later."],
            [693134, 5.0, '2026-07-02', true, 'Blockbuster filmmaking at its absolute peak. The Feyd arena fight in black-and-white infrared is unreal.'],
            [244786, 5.0, '2026-06-20', true, 'Rewatch. Still the most stressful 107 minutes in cinema. "Not quite my tempo."'],
            [244786, 4.5, '2025-01-09', false, 'First watch. J.K. Simmons is terrifying.'],
            [496243, 4.0, '2026-05-30', false, 'The tonal shifts are a magic trick. That basement reveal.'],
            [545611, 3.5, '2026-05-11', false, 'Exhausting in the best and worst ways. The rock scene alone earns it.'],
            [120467, 4.0, '2026-03-22', true, 'Comfort movie. Every frame is a pastry.'],
            [313369, 3.5, '2026-02-15', false, null],
            [965150, 4.5, '2026-01-27', true, 'That closing rave sequence. I was not okay.'],
            [666277, 4.0, '2025-11-03', false, 'Second time. Held up completely.'],
            [693134, 4.5, '2025-09-18', true, 'Opening night, first watch. Needed the rewatch to catch my breath.'],
            [496243, 4.5, '2025-06-04', true, 'First watch. Deserved every award.'],
        ];

        // Insert chronologically so the rewatch flag / "first watched" come out right.
        usort($logs, fn ($a, $b) => strcmp($a[2], $b[2]));

        foreach ($logs as [$tmdb, $rating, $watched, $liked, $comment]) {
            $movieId = $byTmdb($tmdb);
            if (! $movieId) {
                continue;
            }

            $isRewatch = Review::where('movie_id', $movieId)
                ->where('watched_on', '<', $watched)
                ->exists();

            $review = Review::create([
                'movie_id' => $movieId,
                'rating' => $rating,
                'watched_on' => $watched,
                'liked' => $liked,
                'rewatch' => $isRewatch,
                'comment' => $comment,
            ]);

            // Backdate the log so "latest" ordering looks realistic in the demo.
            $review->forceFill(['created_at' => $watched, 'updated_at' => $watched])->saveQuietly();
        }

        // Watchlist entries.
        $watchlist = [
            [120467, 'Rewatch for the production design'],
            [545611, null],
        ];
        foreach ($watchlist as [$tmdb, $note]) {
            if ($id = $byTmdb($tmdb)) {
                WatchlistItem::updateOrCreate(['movie_id' => $id], ['note' => $note]);
            }
        }
    }
}
