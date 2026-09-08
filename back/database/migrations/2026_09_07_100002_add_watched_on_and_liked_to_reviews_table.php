<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'watched_on')) {
                $table->date('watched_on')->nullable()->after('rating');
            }
            if (! Schema::hasColumn('reviews', 'liked')) {
                $table->boolean('liked')->default(false)->after('watched_on');
            }
            if (! Schema::hasColumn('reviews', 'rewatch')) {
                $table->boolean('rewatch')->default(false)->after('liked');
            }
        });

        // Backfill watched_on with the day the log was created so existing rows
        // show up in the diary immediately.
        if (Schema::hasColumn('reviews', 'watched_on')) {
            DB::table('reviews')->whereNull('watched_on')->update([
                'watched_on' => DB::raw('date(created_at)'),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            foreach (['watched_on', 'liked', 'rewatch'] as $col) {
                if (Schema::hasColumn('reviews', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
