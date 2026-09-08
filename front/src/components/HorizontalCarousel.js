import React from 'react';
import PosterCard from './PosterCard';

export default function HorizontalCarousel({ items = [] }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="no-scrollbar overflow-x-auto py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex gap-4 items-start">
                {items.map((it) => (
                    <PosterCard key={it.id || it.tmdb_id} movie={it} className="w-32 sm:w-36 flex-shrink-0" />
                ))}
            </div>
        </div>
    );
}
