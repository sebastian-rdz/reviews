import React, { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { fetchMovie, addToWatchlist, removeFromWatchlist } from '../api';
import StarRating from '../components/StarRating';
import { dayLabel, runtimeLabel, posterFallback } from '../lib/format';

export default function FilmPage() {
    const { id } = useParams();
    const { authed, openReviewModal, dataVersion } = useOutletContext();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [wlBusy, setWlBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await fetchMovie(id);
            setData(d);
            setErr(null);
        } catch (e) {
            setErr(String(e.message || e));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
        load();
    }, [load, dataVersion]);

    if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center text-gray-400">Loading…</div>;
    if (err || !data) return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center text-red-400">{err || 'Not found'}</div>;

    const { movie, reviews = [], stats = {}, in_watchlist } = data;
    const genres = Array.isArray(movie.genres) ? movie.genres : [];
    const cast = Array.isArray(movie.cast_list) ? movie.cast_list : [];

    async function toggleWatchlist() {
        setWlBusy(true);
        try {
            if (in_watchlist) await removeFromWatchlist(movie.id);
            else await addToWatchlist({ movie_id: movie.id });
            await load();
        } catch (e) {
            setErr(String(e.message || e));
        } finally {
            setWlBusy(false);
        }
    }

    return (
        <div>
            {/* Backdrop hero */}
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-40 overflow-hidden bg-gradient-to-br from-indigo-950/50 via-gray-900 to-gray-950 sm:h-52 md:h-60">
                    {movie.backdrop_url && (
                        <img
                            src={movie.backdrop_url}
                            alt=""
                            className="h-full w-full object-cover opacity-40"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-gray-950/20" />
                </div>

                <div className="relative z-10 mx-auto max-w-4xl px-4 pt-16 sm:px-6 sm:pt-24 md:pt-32">
                    <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                        <img
                            src={movie.poster_url || posterFallback()}
                            alt={movie.name}
                            className="w-32 flex-shrink-0 rounded-xl object-cover shadow-card-hover ring-1 ring-white/10 sm:w-40"
                            onError={(e) => {
                                if (e.currentTarget.src !== posterFallback()) e.currentTarget.src = posterFallback();
                            }}
                        />
                        <div className="min-w-0 sm:pt-16">
                            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                                {movie.name}{' '}
                                {movie.release_year && (
                                    <span className="font-sans text-lg font-normal text-gray-400 sm:text-xl">
                                        {movie.release_year}
                                    </span>
                                )}
                            </h1>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300">
                                {movie.director && <span>Directed by {movie.director}</span>}
                                {movie.runtime ? <span>· {runtimeLabel(movie.runtime)}</span> : null}
                                {movie.tmdb_rating ? <span>· TMDB {movie.tmdb_rating}</span> : null}
                            </div>
                            {genres.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {genres.map((g) => (
                                        <span key={g} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {authed && (
                                    <button
                                        onClick={() => openReviewModal(movie)}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                                    >
                                        + Log / Review
                                    </button>
                                )}
                                {authed && (
                                    <button
                                        onClick={toggleWatchlist}
                                        disabled={wlBusy}
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                                            in_watchlist
                                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                                : 'border border-gray-600 text-gray-200 hover:bg-gray-800'
                                        }`}
                                    >
                                        {in_watchlist ? '✓ On watchlist' : '+ Watchlist'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {movie.overview && (
                    <p className="max-w-2xl leading-relaxed text-gray-200">{movie.overview}</p>
                )}

                {/* My history with this film */}
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-gray-700/60 bg-gray-800 p-4">
                    <History label="Times logged" value={stats.times_logged || 0} />
                    <History label="My average" value={stats.average_rating ?? '—'} />
                    {stats.first_watched && <History label="First watched" value={dayLabel(stats.first_watched)} />}
                    {stats.liked && <span className="text-sm text-rose-400">♥ Liked</span>}
                    {(stats.times_logged || 0) > 1 && (
                        <span className="rounded bg-gray-700/70 px-2 py-1 text-xs text-gray-300">
                            Rewatched {stats.times_logged - 1}×
                        </span>
                    )}
                </div>

                {/* Cast */}
                {cast.length > 0 && (
                    <section className="mt-8">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Cast</h2>
                        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
                            {cast.map((c, i) => (
                                <div key={i} className="w-24 flex-shrink-0 text-center">
                                    <img
                                        src={c.profile_url || posterFallback(96, 96)}
                                        alt={c.name}
                                        className="mx-auto h-24 w-24 rounded-full bg-gray-800 object-cover ring-1 ring-white/5"
                                        loading="lazy"
                                        onError={(e) => {
                                            if (e.currentTarget.src !== posterFallback(96, 96))
                                                e.currentTarget.src = posterFallback(96, 96);
                                        }}
                                    />
                                    <div className="mt-1.5 truncate text-xs font-medium text-white">{c.name}</div>
                                    {c.character && <div className="truncate text-[11px] text-gray-500">{c.character}</div>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* My reviews */}
                <section className="mt-8">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        My reviews {reviews.length ? `(${reviews.length})` : ''}
                    </h2>
                    {reviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-700 py-8 text-center text-gray-400">
                            I haven't logged this one yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((r) => (
                                <div key={r.id} className="rounded-xl border border-gray-700/60 bg-gray-800 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                                            <span>Watched {dayLabel(r.watched_on) || dayLabel(r.created_at)}</span>
                                            {r.rewatch && (
                                                <span className="rounded bg-gray-700/70 px-1.5 py-0.5 text-gray-300">Rewatch</span>
                                            )}
                                            {r.liked && <span className="text-rose-400">♥</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-display text-lg font-bold text-indigo-400">{r.rating}</span>
                                            <StarRating value={r.rating} size={13} />
                                        </div>
                                    </div>
                                    {r.comment && (
                                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-200">{r.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="mt-8">
                    <Link to="/" className="text-sm text-gray-400 hover:text-white">
                        ← Back
                    </Link>
                </div>
            </div>
        </div>
    );
}

function History({ label, value }) {
    return (
        <div>
            <div className="font-display text-lg font-bold text-white">{value}</div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        </div>
    );
}
