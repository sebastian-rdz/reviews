import React from 'react';
import StarRating from './StarRating';

// Inline placeholder so a missing poster never triggers an external request / broken image.
const POSTER_FALLBACK =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="144" viewBox="0 0 96 144">
            <rect width="96" height="144" fill="#242b3b"/>
            <path d="M48 58a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 110 8 4 4 0 010-8z" fill="#454c5c"/>
            <text x="48" y="98" font-family="Inter,sans-serif" font-size="9" fill="#626a7d" text-anchor="middle">No poster</text>
        </svg>`
    );

function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export default function ReviewCard({ review }) {
    const m = review.movie || {};
    const date = formatDate(review.created_at || review.date || null);

    return (
        <article className="group flex gap-4 rounded-xl border border-gray-700/60 bg-gray-800 p-4 shadow-card transition-colors hover:border-gray-600">
            <div className="w-20 sm:w-24 flex-shrink-0">
                <img
                    src={m.poster_url || POSTER_FALLBACK}
                    alt={m.name}
                    className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-white/5"
                    loading="lazy"
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold leading-tight text-white">
                            {m.name || '—'}{' '}
                            {m.release_year ? (
                                <span className="font-sans text-sm font-normal text-gray-400">({m.release_year})</span>
                            ) : null}
                        </h3>
                        <div className="mt-0.5 text-sm text-gray-400">
                            {m.director ? `Directed by ${m.director}` : 'Director unknown'}
                        </div>
                        {date && <div className="mt-1 text-xs text-gray-500">Logged {date}</div>}
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <div className="font-display text-2xl font-bold leading-none text-indigo-400">{review.rating}</div>
                        <div className="mt-1">
                            <StarRating value={review.rating} size={13} />
                        </div>
                    </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-200">
                    {review.comment || <span className="italic text-gray-500">No comment</span>}
                </p>
            </div>
        </article>
    );
}
