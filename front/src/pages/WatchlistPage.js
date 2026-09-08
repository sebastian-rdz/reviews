import React, { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchWatchlist, removeFromWatchlist, addToWatchlist, searchMovies } from '../api';
import PosterCard from '../components/PosterCard';

export default function WatchlistPage() {
    const { authed, dataVersion } = useOutletContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [pick, setPick] = useState(null);

    // Add-a-film search
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [searchErr, setSearchErr] = useState(null);
    const [adding, setAdding] = useState(false);
    const debounceRef = useRef(null);

    async function load() {
        setLoading(true);
        try {
            const data = await fetchWatchlist();
            setItems(Array.isArray(data) ? data : []);
            setErr(null);
        } catch (e) {
            setErr(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [dataVersion]);

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

    async function add(item) {
        setAdding(true);
        try {
            const payload = item.local && item.id ? { movie_id: item.id } : { tmdb_id: item.tmdb_id };
            await addToWatchlist(payload);
            setQuery('');
            setSuggestions([]);
            await load();
        } catch (e) {
            setSearchErr(String(e.message || e));
        } finally {
            setAdding(false);
        }
    }

    async function remove(movieId) {
        try {
            await removeFromWatchlist(movieId);
            setItems((xs) => xs.filter((i) => i.movie_id !== movieId));
        } catch (e) {
            setErr(String(e.message || e));
        }
    }

    function surprise() {
        if (items.length) setPick(items[Math.floor(Math.random() * items.length)]);
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white">Watchlist</h1>
                    <p className="text-sm text-gray-400">
                        {items.length} film{items.length !== 1 ? 's' : ''} to get to.
                    </p>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={surprise}
                        className="rounded-lg border border-gray-600 px-3.5 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800"
                    >
                        🎲 Surprise me
                    </button>
                )}
            </div>

            {/* Add a film */}
            {authed && (
                <div className="relative mb-6">
                    <input
                        className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2.5 text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Add a film to the watchlist…"
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
                            {suggestions.map((s) => (
                                <li
                                    key={s.id || s.tmdb_id}
                                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                                        adding ? 'opacity-50' : 'cursor-pointer hover:bg-gray-800'
                                    }`}
                                    onClick={() => !adding && add(s)}
                                >
                                    {s.poster_url ? (
                                        <img src={s.poster_url} alt="" className="h-12 w-8 flex-shrink-0 rounded object-cover" />
                                    ) : (
                                        <div className="h-12 w-8 flex-shrink-0 rounded bg-gray-700" />
                                    )}
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium text-white">{s.title}</div>
                                        <div className="text-xs text-gray-400">{s.release_year || '—'}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {searchErr && (
                        <p className="mt-2 text-xs text-amber-400">
                            Search is unavailable ({searchErr}). Set TMDB_API_KEY in back/.env, or search a film
                            that's already in the library.
                        </p>
                    )}
                </div>
            )}

            {pick && (
                <div className="mb-6 flex items-center gap-4 rounded-xl border border-indigo-500/40 bg-indigo-500/10 p-4">
                    <div className="w-16 flex-shrink-0">
                        <PosterCard movie={pick.movie} showTitle={false} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wide text-indigo-300">Tonight, watch</div>
                        <div className="font-display text-lg font-semibold text-white">
                            {pick.movie?.name}{' '}
                            <span className="text-sm font-normal text-gray-400">{pick.movie?.release_year}</span>
                        </div>
                    </div>
                    <button onClick={() => setPick(null)} className="ml-auto text-gray-400 hover:text-white">
                        ✕
                    </button>
                </div>
            )}

            {loading && <div className="py-16 text-center text-gray-400">Loading…</div>}
            {err && <div className="text-sm text-red-400">{err}</div>}

            {!loading && items.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-700 py-12 text-center text-gray-400">
                    Nothing on the watchlist yet.{authed ? ' Search above to add one.' : ''}
                </div>
            )}

            {!loading && items.length > 0 && (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                    {items.map((item) => (
                        <div key={item.id} className="group/wl relative">
                            <PosterCard movie={item.movie || {}} />
                            {authed && (
                                <button
                                    onClick={() => remove(item.movie_id)}
                                    title="Remove from watchlist"
                                    className="absolute right-1.5 top-1.5 block rounded-full bg-black/70 px-2 py-0.5 text-xs text-white transition hover:bg-red-600 sm:hidden sm:group-hover/wl:block"
                                >
                                    ✕
                                </button>
                            )}
                            {item.note && <p className="mt-1 text-[11px] italic text-gray-500">{item.note}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
