<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);

        // Demo content — never in production. Run explicitly with
        // `php artisan db:seed --class=MovieSeeder` if you ever want it there.
        if (! app()->isProduction()) {
            $this->call(MovieSeeder::class);
            $this->call(ReviewSeeder::class);
        }
    }
}
