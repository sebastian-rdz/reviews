<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            if (! Schema::hasColumn('movies', 'backdrop_path')) {
                $table->string('backdrop_path')->nullable()->after('poster_url');
            }
            if (! Schema::hasColumn('movies', 'backdrop_url')) {
                $table->string('backdrop_url')->nullable()->after('backdrop_path');
            }
            if (! Schema::hasColumn('movies', 'overview')) {
                $table->text('overview')->nullable()->after('backdrop_url');
            }
            if (! Schema::hasColumn('movies', 'runtime')) {
                $table->unsignedSmallInteger('runtime')->nullable()->after('overview');
            }
            if (! Schema::hasColumn('movies', 'genres')) {
                $table->json('genres')->nullable()->after('runtime');
            }
            if (! Schema::hasColumn('movies', 'cast_list')) {
                $table->json('cast_list')->nullable()->after('genres');
            }
            if (! Schema::hasColumn('movies', 'tmdb_rating')) {
                $table->decimal('tmdb_rating', 3, 1)->nullable()->after('cast_list');
            }
        });
    }

    public function down(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            foreach (['backdrop_path', 'backdrop_url', 'overview', 'runtime', 'genres', 'cast_list', 'tmdb_rating'] as $col) {
                if (Schema::hasColumn('movies', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
