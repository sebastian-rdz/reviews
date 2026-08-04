import React, { useEffect, useRef, useState, useMemo } from 'react';
import './index.css';
import {
    fetchReviews,
    login,
    logout,
    searchMovies,
    createMovieFromTmdb,
    createReview,
    fetchFavoriteMovies,
} from './api';
import ProfileHeader from './components/ProfileHeader';
import HorizontalCarousel from './components/HorizontalCarousel';
import ReviewCard from './components/ReviewCard';
import StarInput from './components/StarInput';
import SearchFilterSort from './components/SearchFilterSort';

function App() {
    const [reviews, setReviews] = useState([]);
    const [paginationMeta, setPaginationMeta] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [showRecentMovies, setShowRecentMovies] = useState(true);
    const [showFavoriteMovies, setShowFavoriteMovies] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Auth components
    const [username] = useState('admin');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('authUser'));
        } catch {
            return null;
        }
    });

    // Review components
    const [showForm, setShowForm] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(4);
    const debounceRef = useRef(null);
    const fetchDebounceRef = useRef(null);

    // Login modal
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch favorite movies
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);

    // Sorting
    const [sortBy, setSortBy] = useState('newest');

    // Filters
    const [searchText, setSearchText] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [selectedYear, setSelectedYear] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        return parseInt(localStorage.getItem('itemsPerPage')) || 10;
    });

    // Change items per page
    function changeItemsPerPage(value) {
        const numValue = parseInt(value);
        setItemsPerPage(numValue);
        localStorage.setItem('itemsPerPage', numValue);
        setCurrentPage(1); // Reset to page 1
    }

    // Fetch reviews with filters and pagination
    useEffect(() => {
        let mounted = true;

        // Debounce para no hacer muchas requests mientras escribes
        clearTimeout(fetchDebounceRef.current);

        fetchDebounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    per_page: itemsPerPage,
                    sort_by: sortBy,
                };

                if (searchText) params.search = searchText;
                if (minRating > 0) params.min_rating = minRating;
                if (selectedYear !== 'all') params.year = selectedYear;

                const data = await fetchReviews(params);

                if (mounted) {
                    setReviews(Array.isArray(data.data) ? data.data : []);
                    setPaginationMeta({
                        current_page: data.current_page || 1,
                        last_page: data.last_page || 1,
                        per_page: data.per_page || itemsPerPage,
                        total: data.total || 0,
                        from: data.from || 0,
                        to: data.to || 0,
                    });
                }
            } catch (e) {
                if (mounted) {
                    setErr(String(e));
                    setReviews([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            mounted = false;
            clearTimeout(fetchDebounceRef.current);
        };
    }, [currentPage, sortBy, searchText, minRating, selectedYear, itemsPerPage]);

    // Fetch favorite movies (separate, no pagination)
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const favs = await fetchFavoriteMovies();
                if (mounted) setFavoriteMovies(Array.isArray(favs) ? favs : []);
            } catch (e) {
                console.error('Error fetching favorites:', e);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    // Extract available years from all reviews (need separate endpoint or keep in memory)
    // For now, we'll fetch without pagination to get all years
    const [allYears, setAllYears] = useState([]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Fetch a large number to get all unique years
                const data = await fetchReviews({ per_page: 1000 });
                if (mounted) {
                    const years = new Set();
                    (data.data || []).forEach((r) => {
                        const m = r.movie || {};
                        const year = m.release_year || (m.release_date ? m.release_date.slice(0, 4) : null);
                        if (year) years.add(year);
                    });
                    setAllYears(Array.from(years).sort((a, b) => b - a));
                }
            } catch (e) {
                console.error('Error fetching years:', e);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []); // Solo al cargar

    // Clear all filters
    function clearFilters() {
        setSearchText('');
        setMinRating(0);
        setSelectedYear('all');
        setCurrentPage(1);
    }

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, minRating, selectedYear, sortBy]);

    // Scroll to top when page changes
    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Auth handlers
    async function handleLogin(e) {
        e?.preventDefault();
        try {
            const data = await login({ username, password });
            setUser(data.user || { username });
            localStorage.setItem('authUser', JSON.stringify(data.user || { username }));
            setPassword('');
            setShowLoginModal(false);
        } catch (error) {
            setErr(String(error));
        }
    }

    // Auth handlers
    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('authUser');
        }
    }

    // Review form handlers
    function openForm() {
        setShowForm(true);
        setQuery('');
        setSuggestions([]);
        setSelectedMovie(null);
        setComment('');
        setRating(4);
    }

    // Debounced movie search
    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await searchMovies(query);
                setSuggestions(Array.isArray(res) ? res : []);
            } catch (e) {
                console.error('searchMovies error', e);
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Handle selecting a movie suggestion
    async function handleSelectSuggestion(item) {
        try {
            const movie = await createMovieFromTmdb(item.tmdb_id);
            setSelectedMovie(movie);
            setQuery('');
            setSuggestions([]);
        } catch (e) {
            console.error('createFromTmdb error', e);
            setErr(String(e));
        }
    }

    // Handle review submission
    async function handleSubmitReview(e) {
        e.preventDefault();
        if (!selectedMovie || !selectedMovie.id) {
            setErr('Selecciona una película primero');
            return;
        }
        try {
            const payload = {
                movie_id: selectedMovie.id,
                rating: Number(rating),
                comment: comment || null,
            };
            await createReview(payload);

            // Reset form
            setShowForm(false);
            setSelectedMovie(null);
            setComment('');
            setRating(4);
            setErr(null);

            // Go to page 1 to see the new review (backend will re-fetch)
            setCurrentPage(1);
        } catch (e) {
            console.error('createReview error', e);
            setErr(String(e));
        }
    }

    // Prepare recent movies for carousel (from reviews)
    const recentMovies = [];
    const seen = new Set();
    for (const r of reviews) {
        const m = r.movie || {};
        const id = m.id || m.tmdb_id;
        if (!id) continue;
        if (!seen.has(id)) {
            seen.add(id);
            recentMovies.push({
                id,
                name: m.name || m.title,
                poster_url: m.poster_url,
                poster_path: m.poster_path,
                release_year: m.release_year || (m.release_date ? m.release_date.slice(0, 4) : undefined),
            });
        }
        if (recentMovies.length >= 8) break;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <ProfileHeader title="My Reviews" user={user} onOpenForm={openForm} />

            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Recent Movies Carousel */}
                <section className="mb-6">
                    <div
                        className="flex justify-between items-baseline mb-2 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                        onClick={() => setShowRecentMovies(!showRecentMovies)}
                    >
                        <h2 className="text-lg font-semibold text-white">Recently watched</h2>
                        <span className="text-gray-400 text-sm">{showRecentMovies ? '▼' : '▶'}</span>
                    </div>
                    {showRecentMovies && <HorizontalCarousel items={recentMovies} />}
                </section>

                {/* Favorite Movies Carousel */}
                <section className="mb-6">
                    <div
                        className="flex justify-between items-baseline mb-2 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
                        onClick={() => setShowFavoriteMovies(!showFavoriteMovies)}
                    >
                        <h2 className="text-lg font-semibold text-white">Favorite films</h2>
                        <span className="text-gray-400 text-sm">{showFavoriteMovies ? '▼' : '▶'}</span>
                    </div>
                    {showFavoriteMovies && <HorizontalCarousel items={favoriteMovies} />}
                </section>

                {/* Form */}
                {showForm && (
                    <section className="mb-6 bg-gray-800 p-4 rounded">
                        <h3 className="text-white font-semibold mb-2">New review</h3>

                        <div className="mb-3">
                            <label className="text-sm text-gray-300 block mb-1">Search movie</label>
                            <input
                                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Type title..."
                            />
                            {suggestions.length > 0 && (
                                <ul className="bg-gray-800 border border-gray-700 mt-2 rounded max-h-44 overflow-auto">
                                    {suggestions.map((s) => (
                                        <li
                                            key={s.tmdb_id}
                                            className="p-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={() => handleSelectSuggestion(s)}
                                        >
                                            <div className="text-sm font-medium">{s.title}</div>
                                            <div className="text-xs text-gray-400">{s.release_year}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {selectedMovie && (
                            <div className="mb-3 text-gray-200">
                                <div className="font-medium">
                                    {selectedMovie.name}{' '}
                                    {selectedMovie.release_year ? `(${selectedMovie.release_year})` : ''}
                                </div>
                                <div className="text-xs text-gray-400">Director: {selectedMovie.director || '—'}</div>
                            </div>
                        )}

                        {selectedMovie && (
                            <form onSubmit={handleSubmitReview}>
                                <div className="mb-3">
                                    <label className="text-sm text-gray-300 block mb-1">Comment</label>
                                    <textarea
                                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 mb-4">
                                    <label className="text-sm text-gray-300 block mb-1">Rating</label>
                                    <StarInput value={rating} onChange={(v) => setRating(v)} size={26} />

                                    <div className="" />
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5"
                                        checked={isFavorite}
                                        onChange={(e) => setIsFavorite(e.target.checked)}
                                    />
                                    <label className="ms-0 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        Favorite
                                    </label>
                                </div>

                                <div className="flex gap-2">
                                    <button className="px-3 py-2 bg-indigo-600 rounded text-white" type="submit">
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-2 bg-gray-700 rounded text-white"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}

                        {err && <div className="text-red-400 mt-2">{err}</div>}
                    </section>
                )}

                {/* Search, Filter & Sort controls */}
                <section className="mb-6 bg-gray-800 p-4 rounded-lg">
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <h3 className="text-white font-semibold text-lg">Search & Filter</h3>
                        <div className="flex items-center gap-2">
                            {(searchText || minRating > 0 || selectedYear !== 'all' || sortBy !== 'newest') && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFilters();
                                        setSortBy('newest');
                                    }}
                                    className="text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                                >
                                    Reset all
                                </button>
                            )}
                            <span className="text-gray-400 text-sm">{showFilters ? '▼' : '▶'}</span>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4">
                            <SearchFilterSort
                                searchText={searchText}
                                setSearchText={setSearchText}
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                minRating={minRating}
                                setMinRating={setMinRating}
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                                allYears={allYears}
                                total={paginationMeta.total}
                                clearFilters={clearFilters}
                            />
                        </div>
                    )}
                </section>

                {/* Items per page selector */}
                {!loading && paginationMeta.total > 0 && (
                    <div className="mb-4 flex items-center justify-between gap-3 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Show:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => changeItemsPerPage(e.target.value)}
                                className="px-3 py-1.5 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="10">10 per page</option>
                                <option value="20">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="9999">All ({paginationMeta.total})</option>
                            </select>
                        </div>

                        {paginationMeta.last_page > 1 && (
                            <div className="text-gray-500 text-xs">
                                Page {paginationMeta.current_page} of {paginationMeta.last_page}
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews list */}
                <section>
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    )}

                    {!loading &&
                        paginationMeta.total === 0 &&
                        !searchText &&
                        minRating === 0 &&
                        selectedYear === 'all' && <div className="text-gray-400 text-center py-8">No reviews yet.</div>}

                    {!loading &&
                        paginationMeta.total === 0 &&
                        (searchText || minRating > 0 || selectedYear !== 'all') && (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">No reviews match your filters</div>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}

                    {!loading && reviews.length > 0 && (
                        <>
                            <div className="space-y-4 mt-4">
                                {reviews.map((r) => (
                                    <ReviewCard key={r.id} review={r} />
                                ))}
                            </div>

                            {/* Pagination controls */}
                            {paginationMeta.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className={`px-3 py-2 rounded transition-colors ${
                                            currentPage === 1
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        ← Previous
                                    </button>

                                    {/* Page numbers */}
                                    <div className="flex gap-1 flex-wrap">
                                        {/* First page */}
                                        {currentPage > 3 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                                                >
                                                    1
                                                </button>
                                                {currentPage > 4 && (
                                                    <span className="px-2 py-2 text-gray-500">...</span>
                                                )}
                                            </>
                                        )}

                                        {/* Page range around current */}
                                        {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1)
                                            .filter((page) => {
                                                return (
                                                    page === currentPage ||
                                                    page === currentPage - 1 ||
                                                    page === currentPage + 1 ||
                                                    page === currentPage - 2 ||
                                                    page === currentPage + 2
                                                );
                                            })
                                            .map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-2 rounded transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-indigo-600 text-white font-semibold'
                                                            : 'bg-gray-800 text-white hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                        {/* Last page */}
                                        {currentPage < paginationMeta.last_page - 2 && (
                                            <>
                                                {currentPage < paginationMeta.last_page - 3 && (
                                                    <span className="px-2 py-2 text-gray-500">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(paginationMeta.last_page)}
                                                    className="px-3 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                                                >
                                                    {paginationMeta.last_page}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Next button */}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(paginationMeta.last_page, p + 1))}
                                        disabled={currentPage === paginationMeta.last_page}
                                        className={`px-3 py-2 rounded transition-colors ${
                                            currentPage === paginationMeta.last_page
                                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}

                            {/* Page info */}
                            <div className="mt-4 text-center text-sm text-gray-400">
                                {paginationMeta.last_page === 1 && itemsPerPage >= 9999 ? (
                                    <span>Showing all {paginationMeta.total} reviews</span>
                                ) : paginationMeta.last_page > 1 ? (
                                    <span>
                                        Page {paginationMeta.current_page} of {paginationMeta.last_page} • Showing{' '}
                                        {paginationMeta.from || 0}-{paginationMeta.to || 0} of {paginationMeta.total}{' '}
                                        reviews
                                    </span>
                                ) : paginationMeta.total > 0 ? (
                                    <span>
                                        Showing {paginationMeta.total} review
                                        {paginationMeta.total !== 1 ? 's' : ''}
                                    </span>
                                ) : null}
                            </div>
                        </>
                    )}
                </section>
            </div>

            {/* Info footer */}
            <footer className="py-4 text-center">
                <button className="text-sm text-gray-400 hover:text-white" onClick={handleLogout}>
                    2025
                </button>
                &nbsp;·&nbsp;
                <button className="text-sm text-gray-400 hover:text-white" onClick={() => setShowLoginModal(true)}>
                    Sebastian Rodriguez
                </button>
            </footer>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={() => setShowLoginModal(false)} />
                    <div className="relative bg-gray-800 text-white rounded-lg p-6 w-full max-w-md z-10">
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input
                                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                                placeholder="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button type="submit" className="px-3 py-2 bg-indigo-600 rounded">
                                    Login
                                </button>
                            </div>
                        </form>
                        {err && <div className="text-red-400 mt-3">{err}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
