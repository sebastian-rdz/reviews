import React, { useEffect, useRef, useState } from 'react';
import StarInput from './StarInput';
import { searchMovies, createMovieFromTmdb, createReview } from '../api';

function today() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * The "log a film" form, in a modal. Reachable from the nav (no movie) or from a
 * film page (movie prefilled). Calls onCreated(review) after a successful log.
 */
export default function ReviewModal({ open, movie: prefill = null, onClose, onCreated }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(4);
    const [watchedOn, setWatchedOn] = useState(today());
    const [liked, setLiked] = useState(false);
    const [favorite, setFavorite] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const [searchErr, setSearchErr] = useState(null);
    const debounceRef = useRef(null);

    // Reset every time the modal opens.
    useEffect(() => {
        if (!open) return;
        setQuery('');
        setSuggestions([]);
        setSelectedMovie(prefill || null);
        setComment('');
        setRating(4);
        setWatchedOn(today());
        setLiked(false);
        setFavorite(Boolean(prefill?.favorite));
        setErr(null);
        setSearchErr(null);
    }, [open, prefill]);

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearchErr(null);
            try {
                const res = await searchMovies(query);
                setSuggestions(Array.isArray(res) ? res : []);
            } catch (e) {
                setSuggestions([]);
                setSearchErr(String(e.message || e));
            }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    // Close on Escape.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    async function pickSuggestion(item) {
        setErr(null);
        try {
            // Local results (offline / no TMDB key) already have a movie id.
            const m = item.local && item.id ? item : await createMovieFromTmdb(item.tmdb_id);
            setSelectedMovie(m);
            setQuery('');
            setSuggestions([]);
        } catch (e) {
            setErr(String(e.message || e));
        }
    }

    async function submit(e) {
        e.preventDefault();
        if (!selectedMovie?.id) {
            setErr('Pick a film first');
            return;
        }
        setBusy(true);
        setErr(null);
        try {
            const review = await createReview({
                movie_id: selectedMovie.id,
                rating: Number(rating),
                comment: comment || null,
                watched_on: watchedOn || null,
                liked,
                favorite,
            });
            onCreated?.(review);
            onClose();
        } catch (e) {
            setErr(String(e.message || e));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-xl border border-gray-700/60 bg-gray-800 p-5 text-white shadow-card-hover">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">Log a film</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        ✕
                    </button>
                </div>

                {!selectedMovie && (
                    <div className="mb-4">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Search film
                        </label>
                        <input
                            autoFocus
                            className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2.5 text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a title…"
                        />
                        {suggestions.length > 0 && (
                            <ul className="mt-2 max-h-60 overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
                                {suggestions.map((s) => (
                                    <li
                                        key={s.id || s.tmdb_id}
                                        className="flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors hover:bg-gray-800"
                                        onClick={() => pickSuggestion(s)}
                                    >
                                        {s.poster_url ? (
                                            <img src={s.poster_url} alt="" className="h-12 w-8 flex-shrink-0 rounded object-cover" />
                                        ) : (
                                            <div className="h-12 w-8 flex-shrink-0 rounded bg-gray-700" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">{s.title}</div>
                                            <div className="text-xs text-gray-400">{s.release_year || '—'}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {searchErr && (
                            <p className="mt-2 text-xs text-amber-400">
                                Search is unavailable ({searchErr}). Set TMDB_API_KEY in back/.env, or type a title
                                that's already in the library.
                            </p>
                        )}
                        {query && !searchErr && suggestions.length === 0 && (
                            <p className="mt-2 text-xs text-gray-500">No matches.</p>
                        )}
                    </div>
                )}

                {selectedMovie && (
                    <form onSubmit={submit}>
                        <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-900/50 p-3">
                            {selectedMovie.poster_url && (
                                <img src={selectedMovie.poster_url} alt="" className="h-16 w-11 flex-shrink-0 rounded object-cover" />
                            )}
                            <div className="min-w-0">
                                <div className="truncate font-medium">
                                    {selectedMovie.name}{' '}
                                    {selectedMovie.release_year ? (
                                        <span className="text-sm font-normal text-gray-400">({selectedMovie.release_year})</span>
                                    ) : null}
                                </div>
                                <div className="truncate text-xs text-gray-400">
                                    {selectedMovie.director ? `Directed by ${selectedMovie.director}` : ''}
                                </div>
                            </div>
                            {!prefill && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedMovie(null)}
                                    className="ml-auto text-xs text-gray-400 hover:text-white"
                                >
                                    Change
                                </button>
                            )}
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Rating
                                </label>
                                <StarInput value={rating} onChange={setRating} size={28} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Watched on
                                </label>
                                <input
                                    type="date"
                                    value={watchedOn}
                                    max={today()}
                                    onChange={(e) => setWatchedOn(e.target.value)}
                                    className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2 text-white transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Review
                            </label>
                            <textarea
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Optional…"
                                className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2.5 text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="mb-5 flex flex-wrap gap-4">
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-300">
                                <input type="checkbox" className="h-4 w-4 accent-rose-500" checked={liked} onChange={(e) => setLiked(e.target.checked)} />
                                <span className="text-rose-400">♥</span> Liked
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-300">
                                <input type="checkbox" className="h-4 w-4 accent-indigo-500" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} />
                                Favorite film
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={busy}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
                            >
                                {busy ? 'Saving…' : 'Save log'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
            </div>
        </div>
    );
}
