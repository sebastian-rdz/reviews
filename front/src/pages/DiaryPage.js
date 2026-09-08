import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchDiary } from '../api';
import ReviewCard from '../components/ReviewCard';
import JournalFilters from '../components/JournalFilters';
import { monthKey, monthLabel } from '../lib/format';

export default function DiaryPage() {
    const { dataVersion } = useOutletContext();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const [search, setSearch] = useState('');
    const [minRating, setMinRating] = useState(0);
    const [year, setYear] = useState('all');
    const [likedOnly, setLikedOnly] = useState(false);

    // Year options grow over time and never shrink, so filtering by year doesn't
    // collapse the dropdown to a single option.
    const [years, setYears] = useState([]);
    const yearsRef = useRef(new Set());
    const debounceRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await fetchDiary({
                    search,
                    min_rating: minRating || undefined,
                    year,
                    liked: likedOnly || undefined,
                });
                if (!mounted) return;
                const list = Array.isArray(data) ? data : [];
                setEntries(list);
                let changed = false;
                for (const e of list) {
                    const y = e.movie?.release_year;
                    if (y && !yearsRef.current.has(y)) {
                        yearsRef.current.add(y);
                        changed = true;
                    }
                }
                if (changed) setYears(Array.from(yearsRef.current).sort((a, b) => b - a));
            } catch (e) {
                if (mounted) setErr(String(e.message || e));
            } finally {
                if (mounted) setLoading(false);
            }
        }, 250);
        return () => {
            mounted = false;
            clearTimeout(debounceRef.current);
        };
    }, [dataVersion, search, minRating, year, likedOnly]);

    const groups = useMemo(() => {
        const map = new Map();
        for (const e of entries) {
            const key = monthKey(e.watched_on || e.created_at);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(e);
        }
        return Array.from(map.entries());
    }, [entries]);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-5">
                <h1 className="font-display text-2xl font-bold text-white">Journal</h1>
                <p className="text-sm text-gray-400">Everything I've watched, newest first.</p>
            </div>

            <JournalFilters
                search={search}
                setSearch={setSearch}
                minRating={minRating}
                setMinRating={setMinRating}
                year={year}
                setYear={setYear}
                years={years}
                likedOnly={likedOnly}
                setLikedOnly={setLikedOnly}
                total={entries.length}
            />

            {loading && <div className="py-16 text-center text-gray-400">Loading…</div>}
            {err && <div className="text-sm text-red-400">{err}</div>}

            {!loading && entries.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-700 py-12 text-center text-gray-400">
                    Nothing here.
                </div>
            )}

            {!loading &&
                groups.map(([key, items]) => (
                    <section key={key} className="mb-8">
                        <div className="sticky top-14 z-10 -mx-4 mb-3 bg-gray-950/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
                            <h2 className="font-display text-lg font-semibold text-white">{monthLabel(key)}</h2>
                            <span className="text-xs text-gray-500">
                                {items.length} film{items.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {items.map((r) => (
                                <ReviewCard key={r.id} review={r} />
                            ))}
                        </div>
                    </section>
                ))}
        </div>
    );
}
