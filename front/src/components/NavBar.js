import React from 'react';
import { NavLink } from 'react-router-dom';

// Stats is intentionally not here — it's reached by tapping the average rating
// in the profile header.
const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/diary', label: 'Journal' },
    { to: '/watchlist', label: 'List', full: 'Watchlist' },
];

export default function NavBar({ authed, onLog }) {
    return (
        <header className="sticky top-0 z-30 border-b border-gray-700/60 bg-gray-950/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-4xl items-center gap-1 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
                <NavLink to="/" className="mr-1 flex-shrink-0 font-display text-base font-bold tracking-tight text-white sm:mr-2 sm:text-lg">
                    Reviews
                </NavLink>

                <div className="flex items-center gap-0.5 text-sm sm:gap-1">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            className={({ isActive }) =>
                                `rounded-lg px-2 py-1.5 font-medium transition-colors sm:px-2.5 ${
                                    isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                                }`
                            }
                        >
                            <span className="sm:hidden">{l.label}</span>
                            <span className="hidden sm:inline">{l.full || l.label}</span>
                        </NavLink>
                    ))}
                </div>

                {authed && (
                    <button
                        onClick={onLog}
                        className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                    >
                        <span className="text-base leading-none">+</span> Log
                    </button>
                )}
            </nav>
        </header>
    );
}
