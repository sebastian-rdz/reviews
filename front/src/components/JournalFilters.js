import React from 'react';

const RATINGS = [
    { v: 0, label: 'All' },
    { v: 3, label: '3+' },
    { v: 4, label: '4+' },
    { v: 4.5, label: '4.5+' },
    { v: 5, label: '5' },
];

/**
 * Lightweight, borderless filter row for the Journal. Deliberately has no card,
 * title or chevron — it should read as part of the list header.
 */
export default function JournalFilters({
    search,
    setSearch,
    minRating,
    setMinRating,
    year,
    setYear,
    years = [],
    likedOnly,
    setLikedOnly,
    total,
}) {
    const active = search || minRating > 0 || year !== 'all' || likedOnly;

    return (
        <div className="mb-6 border-b border-gray-800 pb-4">
            <div className="relative">
                <svg
                    className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title or director…"
                    className="w-full border-0 border-b border-transparent bg-transparent py-1.5 pl-6 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-0"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center gap-1.5">
                    {RATINGS.map((r) => (
                        <button
                            key={r.v}
                            onClick={() => setMinRating(r.v)}
                            className={`rounded-full px-2 py-1 font-medium transition-colors ${
                                minRating === r.v ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {r.label === 'All' ? 'All' : `${r.label} ★`}
                        </button>
                    ))}
                </div>

                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="rounded-md border border-gray-700 bg-gray-900 px-2 py-1 text-gray-300 focus:border-indigo-500 focus:outline-none"
                >
                    <option value="all">Any year</option>
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => setLikedOnly(!likedOnly)}
                    className={`rounded-full px-2 py-1 font-medium transition-colors ${
                        likedOnly ? 'bg-rose-500/20 text-rose-300' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    ♥ Liked
                </button>

                <span className="ml-auto text-gray-500">
                    {total} {total === 1 ? 'entry' : 'entries'}
                    {active && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setMinRating(0);
                                setYear('all');
                                setLikedOnly(false);
                            }}
                            className="ml-2 text-indigo-400 hover:text-indigo-300"
                        >
                            clear
                        </button>
                    )}
                </span>
            </div>
        </div>
    );
}
