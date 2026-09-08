import React from 'react';
import { Link } from 'react-router-dom';
import { posterFallback } from '../lib/format';

/**
 * A single poster tile. Links to the film detail page when the movie has an id.
 * `rating` / `liked` render a small overlay badge (used in the grid + diary).
 */
export default function PosterCard({ movie = {}, rating = null, liked = false, showTitle = true, className = '' }) {
    const title = movie.name || movie.title || '';
    const year = movie.release_year || (movie.release_date ? movie.release_date.slice(0, 4) : '');
    const src = movie.poster_url || (movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : posterFallback());

    const inner = (
        <>
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-700 ring-1 ring-white/5 shadow-card transition duration-200 group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:ring-indigo-500/50">
                <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        if (e.currentTarget.src !== posterFallback()) e.currentTarget.src = posterFallback();
                    }}
                />
                {(rating != null || liked) && (
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6 text-xs">
                        {rating != null && (
                            <span className="font-semibold text-[#f5c518]">★ {rating}</span>
                        )}
                        {liked && <span className="text-rose-400">♥</span>}
                    </div>
                )}
            </div>
            {showTitle && (
                <div className="mt-2">
                    <div className="truncate text-sm font-medium text-white">{title}</div>
                    {year && <div className="text-xs text-gray-400">{year}</div>}
                </div>
            )}
        </>
    );

    if (movie.id) {
        return (
            <Link to={`/film/${movie.id}`} className={`group block ${className}`}>
                {inner}
            </Link>
        );
    }
    return <div className={`group block ${className}`}>{inner}</div>;
}
