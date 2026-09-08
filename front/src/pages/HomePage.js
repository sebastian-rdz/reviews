import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchReviews, fetchFavoriteMovies, fetchStats } from '../api';
import ProfileHeader from '../components/ProfileHeader';
import HorizontalCarousel from '../components/HorizontalCarousel';
import ReviewCard from '../components/ReviewCard';
import PosterCard from '../components/PosterCard';

export default function HomePage() {
    const { dataVersion } = useOutletContext();

    const [recent, setRecent] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const [showRecent, setShowRecent] = useState(true);
    const [showFavorites, setShowFavorites] = useState(true);
    const [view, setView] = useState(() => localStorage.getItem('homeView') || 'grid');

    function changeView(v) {
        setView(v);
        localStorage.setItem('homeView', v);
    }

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        (async () => {
            try {
                const [reviewsPage, favs, st] = await Promise.all([
                    fetchReviews({ per_page: 24, sort_by: 'newest' }),
                    fetchFavoriteMovies(),
                    fetchStats(),
                ]);
                if (!mounted) return;
                setRecent(Array.isArray(reviewsPage.data) ? reviewsPage.data : []);
                setFavoriteMovies(Array.isArray(favs) ? favs : []);
                setStats(st?.has_data ? st.totals : null);
                setErr(null);
            } catch (e) {
                if (mounted) setErr(String(e.message || e));
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [dataVersion]);

    const recentMovies = useMemo(() => {
        const seen = new Set();
        const out = [];
        for (const r of recent) {
            const m = r.movie || {};
            if (!m.id || seen.has(m.id)) continue;
            seen.add(m.id);
            out.push(m);
            if (out.length >= 12) break;
        }
        return out;
    }, [recent]);

    const gridItems = recent.slice(0, 18);
    const listItems = recent.slice(0, 6);

    return (
        <>
            <ProfileHeader title="Watched by Sebastian" stats={stats} />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <Shelf title="Recently watched" open={showRecent} onToggle={() => setShowRecent(!showRecent)}>
                    <HorizontalCarousel items={recentMovies} />
                </Shelf>

                <Shelf title="Favorite films" open={showFavorites} onToggle={() => setShowFavorites(!showFavorites)}>
                    <HorizontalCarousel items={favoriteMovies} />
                </Shelf>

                <section>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recently logged</h2>
                        <div className="inline-flex overflow-hidden rounded-lg border border-gray-700 text-xs">
                            {['grid', 'list'].map((v) => (
                                <button
                                    key={v}
                                    onClick={() => changeView(v)}
                                    className={`px-2.5 py-1 font-medium capitalize transition-colors ${
                                        view === v ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (view === 'grid' ? <GridSkeleton /> : <ListSkeleton />)}
                    {err && <div className="text-sm text-red-400">{err}</div>}

                    {!loading && recent.length === 0 && !err && (
                        <div className="rounded-xl border border-dashed border-gray-700 py-12 text-center">
                            <div className="mb-2 text-3xl">🎬</div>
                            <div className="text-gray-400">No reviews yet.</div>
                        </div>
                    )}

                    {!loading && recent.length > 0 && view === 'grid' && (
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                            {gridItems.map((r) => (
                                <PosterCard key={r.id} movie={r.movie || {}} rating={r.rating} liked={r.liked} />
                            ))}
                        </div>
                    )}

                    {!loading && recent.length > 0 && view === 'list' && (
                        <div className="space-y-4">
                            {listItems.map((r) => (
                                <ReviewCard key={r.id} review={r} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}

function Shelf({ title, open, onToggle, children }) {
    return (
        <section className="mb-8">
            <div
                className="group -mx-2 mb-1 flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-800/60"
                onClick={onToggle}
            >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 transition-colors group-hover:text-gray-200">
                    {title}
                </h2>
                <span className="text-xs text-gray-500 transition-colors group-hover:text-gray-300">{open ? '▼' : '▶'}</span>
            </div>
            {open && children}
        </section>
    );
}

function GridSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton aspect-[2/3] rounded-lg" />
            ))}
        </div>
    );
}

function ListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-gray-700/60 bg-gray-800 p-4">
                    <div className="skeleton aspect-[2/3] w-16 flex-shrink-0 rounded-lg sm:w-24" />
                    <div className="flex-1 space-y-2.5 py-1">
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton h-3 w-1/3" />
                        <div className="skeleton mt-4 h-3 w-full" />
                        <div className="skeleton h-3 w-5/6" />
                    </div>
                </div>
            ))}
        </div>
    );
}
