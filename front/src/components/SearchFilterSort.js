import React from 'react';

const pill = (active) =>
    `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

function SearchFilterSort({
    searchText,
    setSearchText,
    sortBy,
    setSortBy,
    minRating,
    setMinRating,
    selectedYear,
    setSelectedYear,
    allYears,
    total,
    clearFilters,
}) {
    const hasActiveFilters = searchText || minRating > 0 || selectedYear !== 'all';

    return (
        <>
            {/* Search bar */}
            <div className="mb-4 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by title or director"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-gray-900/60 text-white border border-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {searchText && (
                    <button
                        onClick={() => setSearchText('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Sort by */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
                        Sort by
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'newest'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Newest
                        </button>
                        <button
                            onClick={() => setSortBy('rating')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                sortBy === 'rating'
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-gray-700/60 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            Rating
                        </button>
                    </div>
                </div>

                {/* Rating filter */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">
                        Min. rating
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => setMinRating(0)} className={pill(minRating === 0)}>
                            All
                        </button>
                        <button onClick={() => setMinRating(3)} className={pill(minRating === 3)}>
                            3+ ★
                        </button>
                        <button onClick={() => setMinRating(4)} className={pill(minRating === 4)}>
                            4+ ★
                        </button>
                        <button onClick={() => setMinRating(4.5)} className={pill(minRating === 4.5)}>
                            4.5+
                        </button>
                        <button onClick={() => setMinRating(5)} className={pill(minRating === 5)}>
                            5 ★
                        </button>
                    </div>
                </div>

                {/* Year filter */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 block mb-2">Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-900/60 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                    >
                        <option value="all">All years</option>
                        {allYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results count & active filters indicator */}
            <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-700">
                <div className="text-gray-400">
                    <span>
                        {total} review
                        {total !== 1 ? 's' : ''}
                        {hasActiveFilters && <span className="text-indigo-400 font-semibold ml-1">(filtered)</span>}
                    </span>
                </div>
                {hasActiveFilters && (
                    <div className="flex gap-1.5 items-center text-xs">
                        <span className="text-gray-500">Active filters:</span>
                        {searchText && (
                            <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded-md">
                                "{searchText}"
                            </span>
                        )}
                        {minRating > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded-md">{minRating}+ ★</span>
                        )}
                        {selectedYear !== 'all' && (
                            <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded-md">{selectedYear}</span>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default SearchFilterSort;
