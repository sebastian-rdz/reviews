import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fetchStats } from '../api';
import { dayLabel } from '../lib/format';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function StatsPage() {
    const { dataVersion } = useOutletContext();
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        (async () => {
            try {
                const d = await fetchStats(year);
                if (mounted) setData(d);
            } catch (e) {
                if (mounted) setErr(String(e.message || e));
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [year, dataVersion]);

    if (loading) return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center text-gray-400">Loading…</div>;
    if (err) return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center text-red-400">{err}</div>;
    if (!data?.has_data)
        return (
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center text-gray-400">
                Once I've logged a few films, the stats show up here.
            </div>
        );

    const t = data.totals;
    const dist = data.rating_distribution || {};
    const maxDist = Math.max(1, ...Object.values(dist));
    const decades = Object.entries(data.by_decade || {});
    const maxDecade = Math.max(1, ...decades.map(([, c]) => c));
    const perMonth = data.per_month || {};
    const maxMonth = Math.max(1, ...Object.values(perMonth));

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-white">Stats</h1>
                    <p className="text-sm text-gray-400">
                        {data.first_log && `Logging since ${dayLabel(data.first_log)}`}
                    </p>
                </div>
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {Array.from({ length: 6 }).map((_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Big numbers */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <Tile value={t.films} label="films" />
                <Tile value={t.logs} label="total logs" />
                <Tile value={t.this_year} label={`watched in ${data.year}`} />
                <Tile value={t.hours ? `${t.hours}h` : '—'} label="in the cinema" />
                <Tile value={t.average_rating ?? '—'} label="average ★" />
                <Tile value={t.liked} label="♥ liked" />
                <Tile value={t.rewatches} label="rewatches" />
                <Tile value={data.top_directors?.[0]?.director || '—'} label="most-watched dir." small />
            </div>

            {/* Rating distribution */}
            <Panel title="Rating distribution">
                <VBars
                    data={Object.entries(dist).map(([k, c]) => ({ label: k, count: c }))}
                    max={maxDist}
                    color="bg-indigo-500/80"
                    height={150}
                />
            </Panel>

            {/* Per month */}
            <Panel title={`Films per month · ${data.year}`}>
                <VBars
                    data={MONTHS.map((m, i) => ({ label: m, count: perMonth[i + 1] || 0 }))}
                    max={maxMonth}
                    color="bg-emerald-500/70"
                    height={120}
                />
            </Panel>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Decades */}
                <Panel title="By decade">
                    <div className="space-y-2">
                        {decades.map(([d, c]) => (
                            <BarRow key={d} label={`${d}s`} count={c} pct={(c / maxDecade) * 100} />
                        ))}
                    </div>
                </Panel>

                {/* Genres */}
                <Panel title="Top genres">
                    <div className="space-y-2">
                        {(data.by_genre || []).map((g) => (
                            <BarRow
                                key={g.genre}
                                label={g.genre}
                                count={g.count}
                                pct={(g.count / (data.by_genre[0]?.count || 1)) * 100}
                                color="bg-fuchsia-500/70"
                            />
                        ))}
                    </div>
                </Panel>
            </div>

            {/* Directors */}
            <Panel title="Most-watched directors">
                <div className="space-y-2">
                    {(data.top_directors || []).map((d) => (
                        <BarRow
                            key={d.director}
                            label={d.director}
                            count={d.count}
                            pct={(d.count / (data.top_directors[0]?.count || 1)) * 100}
                            color="bg-amber-500/70"
                        />
                    ))}
                </div>
            </Panel>
        </div>
    );
}

function Tile({ value, label, small = false }) {
    return (
        <div className="rounded-xl border border-gray-700/60 bg-gray-800 p-3 sm:p-4">
            <div className={`font-display font-bold leading-tight text-white ${small ? 'truncate text-sm sm:text-base' : 'text-xl sm:text-2xl'}`}>
                {value}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
        </div>
    );
}

function VBars({ data, max, color, height }) {
    return (
        <div className="flex items-end gap-1.5" style={{ height }}>
            {data.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <div className="text-[10px] text-gray-500">{d.count || ''}</div>
                    <div
                        className={`w-full rounded-t ${color}`}
                        style={{ height: `${max ? (d.count / max) * 100 : 0}%`, minHeight: d.count ? 4 : 0 }}
                    />
                    <div className="text-[10px] text-gray-500">{d.label}</div>
                </div>
            ))}
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <section className="mt-4 rounded-xl border border-gray-700/60 bg-gray-800 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</h2>
            {children}
        </section>
    );
}

function BarRow({ label, count, pct, color = 'bg-indigo-500/70' }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="w-28 flex-shrink-0 truncate text-gray-300">{label}</div>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-900">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, 3)}%` }} />
            </div>
            <div className="w-6 flex-shrink-0 text-right text-gray-400">{count}</div>
        </div>
    );
}
