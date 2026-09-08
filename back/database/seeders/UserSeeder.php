<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Idempotent so re-running the seeder never creates a duplicate admin.
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Sebastian Rodriguez',
                'password' => bcrypt(env('ADMIN_SEED_PASSWORD', 'sebastianzavala')),
            ]
        );
    }
}
