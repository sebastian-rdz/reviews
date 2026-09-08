import React from 'react';

export default function HorizontalCarousel({ items = [], onClickCard }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="no-scrollbar overflow-x-auto py-3 -mx-6 px-6">
            <div className="flex gap-4 items-start">
                {items.map(it => {
                    const year = it.release_year || (it.release_date ? it.release_date.slice(0, 4) : '');
                    return (
                        <div key={it.id || it.tmdb_id} className="w-32 sm:w-36 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => onClickCard && onClickCard(it)}
                                className="group block w-full text-left focus:outline-none"
                            >
                                <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-700 ring-1 ring-white/5 shadow-card transition duration-200 group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:ring-indigo-500/50 group-focus-visible:ring-2 group-focus-visible:ring-indigo-500">
                                    <img
                                        src={it.poster_url || `https://image.tmdb.org/t/p/w342${it.poster_path || ''}`}
                                        alt={it.name || it.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                </div>
                                <div className="mt-2">
                                    <div className="truncate text-sm font-medium text-white">{it.name || it.title}</div>
                                    <div className="text-xs text-gray-400">{year}</div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
