<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Support\Tmdb;
use Illuminate\Database\Seeder;

class MovieSeeder extends Seeder
{
    /**
     * A small, curated set of films. When a TMDB API key is configured we pull
     * the real metadata (posters, backdrops, cast, runtime, genres); otherwise
     * we fall back to the baked-in data below so the app is still demoable offline.
     */
    public function run(): void
    {
        foreach ($this->films() as $film) {
            $attrs = null;

            if (Tmdb::configured()) {
                $attrs = Tmdb::movie($film['tmdb_id']);
            }

            $attrs = array_merge($film, $attrs ?? $this->fallback($film));

            $attrs['favorite'] = $film['favorite'];
            Movie::updateOrCreate(['tmdb_id' => $film['tmdb_id']], $attrs);
        }
    }

    private function films(): array
    {
        return [
            ['tmdb_id' => 666277, 'name' => 'Past Lives', 'director' => 'Celine Song', 'release_year' => 2023, 'favorite' => true],
            ['tmdb_id' => 693134, 'name' => 'Dune: Part Two', 'director' => 'Denis Villeneuve', 'release_year' => 2024, 'favorite' => true],
            ['tmdb_id' => 244786, 'name' => 'Whiplash', 'director' => 'Damien Chazelle', 'release_year' => 2014, 'favorite' => true],
            ['tmdb_id' => 496243, 'name' => 'Parasite', 'director' => 'Bong Joon-ho', 'release_year' => 2019, 'favorite' => false],
            ['tmdb_id' => 545611, 'name' => 'Everything Everywhere All at Once', 'director' => 'Daniel Kwan', 'release_year' => 2022, 'favorite' => false],
            ['tmdb_id' => 120467, 'name' => 'The Grand Budapest Hotel', 'director' => 'Wes Anderson', 'release_year' => 2014, 'favorite' => false],
            ['tmdb_id' => 313369, 'name' => 'La La Land', 'director' => 'Damien Chazelle', 'release_year' => 2016, 'favorite' => false],
            ['tmdb_id' => 965150, 'name' => 'Aftersun', 'director' => 'Charlotte Wells', 'release_year' => 2022, 'favorite' => true],
        ];
    }

    /** Offline metadata keyed by tmdb_id. Poster paths verified against the TMDB CDN. */
    private function fallback(array $film): array
    {
        $data = [
            666277 => ['runtime' => 106, 'tmdb_rating' => 7.8, 'poster' => '/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg', 'genres' => ['Romance', 'Drama'],
                'overview' => 'Nora and Hae Sung, two childhood friends, reunite in New York two decades after Nora emigrated from South Korea.',
                'cast' => ['Greta Lee' => 'Nora', 'Teo Yoo' => 'Hae Sung', 'John Magaro' => 'Arthur']],
            693134 => ['runtime' => 167, 'tmdb_rating' => 8.2, 'poster' => '/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg', 'genres' => ['Science Fiction', 'Adventure'],
                'overview' => 'Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
                'cast' => ['Timothée Chalamet' => 'Paul', 'Zendaya' => 'Chani', 'Rebecca Ferguson' => 'Jessica']],
            244786 => ['runtime' => 107, 'tmdb_rating' => 8.4, 'poster' => '/7fn624j5lj3xTme2SgiLCeuedmO.jpg', 'genres' => ['Drama', 'Music'],
                'overview' => 'A promising young drummer enrolls at a cut-throat music conservatory under a ruthless instructor.',
                'cast' => ['Miles Teller' => 'Andrew', 'J.K. Simmons' => 'Fletcher']],
            496243 => ['runtime' => 133, 'tmdb_rating' => 8.5, 'poster' => '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', 'genres' => ['Comedy', 'Thriller', 'Drama'],
                'overview' => 'A poor family schemes to become employed by a wealthy household, until an unexpected incident threatens everything.',
                'cast' => ['Song Kang-ho' => 'Ki-taek', 'Lee Sun-kyun' => 'Dong-ik', 'Cho Yeo-jeong' => 'Yeon-kyo']],
            545611 => ['runtime' => 139, 'tmdb_rating' => 7.8, 'poster' => '/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', 'genres' => ['Action', 'Adventure', 'Science Fiction'],
                'overview' => 'An aging Chinese immigrant is swept into an adventure across parallel universes to save existence.',
                'cast' => ['Michelle Yeoh' => 'Evelyn', 'Ke Huy Quan' => 'Waymond', 'Stephanie Hsu' => 'Joy']],
            120467 => ['runtime' => 99, 'tmdb_rating' => 8.0, 'poster' => '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg', 'genres' => ['Comedy', 'Drama'],
                'overview' => 'The adventures of Gustave H, a legendary concierge, and Zero, the lobby boy who becomes his most trusted friend.',
                'cast' => ['Ralph Fiennes' => 'M. Gustave', 'Tony Revolori' => 'Zero']],
            313369 => ['runtime' => 129, 'tmdb_rating' => 7.9, 'poster' => '/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', 'genres' => ['Comedy', 'Drama', 'Romance', 'Music'],
                'overview' => 'An aspiring actress and a jazz musician chase their dreams — and each other — in Los Angeles.',
                'cast' => ['Ryan Gosling' => 'Sebastian', 'Emma Stone' => 'Mia']],
            965150 => ['runtime' => 102, 'tmdb_rating' => 7.7, 'poster' => null, 'genres' => ['Drama'],
                'overview' => 'Sophie reflects on the joy and melancholy of a holiday she took with her father twenty years earlier.',
                'cast' => ['Paul Mescal' => 'Calum', 'Frankie Corio' => 'Sophie']],
        ];

        $d = $data[$film['tmdb_id']] ?? ['runtime' => null, 'tmdb_rating' => null, 'poster' => null, 'genres' => [], 'overview' => null, 'cast' => []];

        $cast = [];
        foreach ($d['cast'] as $name => $character) {
            $cast[] = ['name' => $name, 'character' => $character, 'profile_url' => null];
        }

        return [
            'runtime' => $d['runtime'],
            'tmdb_rating' => $d['tmdb_rating'],
            'genres' => $d['genres'],
            'overview' => $d['overview'],
            'cast_list' => $cast,
            'poster_path' => $d['poster'],
            'poster_url' => $d['poster'] ? 'https://image.tmdb.org/t/p/w342'.$d['poster'] : null,
            'backdrop_path' => null,
            'backdrop_url' => null,
        ];
    }
}
