import React from 'react';
import { Link } from 'react-router-dom';

export default function ProfileHeader({ title = 'Watched by Sebastian', tagline = 'a personal film log', stats = null }) {
    return (
        <div className="border-b border-gray-800 bg-gray-900/40">
            <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <img
                        src="https://sebastianrdz.com/assets/images/cv.jpg"
                        alt="avatar"
                        className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-gray-950 sm:h-16 sm:w-16"
                    />
                    <div className="min-w-0">
                        <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h1>
                        <p className="text-sm text-gray-400">{tagline}</p>
                    </div>
                </div>

                {stats && (
                    <div className="mt-4 flex items-stretch gap-2 text-center sm:mt-5 sm:gap-3">
                        <Stat value={stats.films} label="films" />
                        <Stat value={stats.this_year} label={`in ${new Date().getFullYear()}`} />
                        {/* The average rating is the way into the Stats page. */}
                        <Link
                            to="/stats"
                            className="flex-1 rounded-lg border border-gray-700/60 bg-gray-800/60 px-2 py-2 transition-colors hover:border-indigo-500/60 hover:bg-gray-800"
                            title="See all my stats"
                        >
                            <div className="font-display text-lg font-bold text-white sm:text-xl">
                                {stats.average_rating ?? '—'} <span className="text-[#f5c518]">★</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wide text-indigo-300 sm:text-[11px]">
                                avg · stats ›
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function Stat({ value, label }) {
    return (
        <div className="flex-1 rounded-lg border border-gray-700/60 bg-gray-800/40 px-2 py-2">
            <div className="font-display text-lg font-bold text-white sm:text-xl">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 sm:text-[11px]">{label}</div>
        </div>
    );
}
