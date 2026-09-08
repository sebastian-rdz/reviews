import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { dayLabel, posterFallback } from '../lib/format';

export default function ReviewCard({ review, showPoster = true }) {
    const m = review.movie || {};
    const watched = dayLabel(review.watched_on) || dayLabel(review.created_at || review.date);

    return (
        <article className="group flex gap-3 rounded-xl border border-gray-700/60 bg-gray-800 p-3 shadow-card transition-colors hover:border-gray-600 sm:gap-4 sm:p-4">
            {showPoster && (
                <Link to={m.id ? `/film/${m.id}` : '#'} className="w-16 flex-shrink-0 sm:w-24">
                    <img
                        src={m.poster_url || posterFallback()}
                        alt={m.name}
                        className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-white/5 transition group-hover:ring-indigo-500/40"
                        loading="lazy"
                    />
                </Link>
            )}
            <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                    <div className="min-w-0">
                        <h3 className="font-display text-base font-semibold leading-tight text-white sm:text-lg">
                            {m.id ? (
                                <Link to={`/film/${m.id}`} className="hover:text-indigo-300 transition-colors">
                                    {m.name || '—'}
                                </Link>
                            ) : (
                                m.name || '—'
                            )}{' '}
                            {m.release_year ? (
                                <span className="font-sans text-sm font-normal text-gray-400">({m.release_year})</span>
                            ) : null}
                        </h3>
                        <div className="mt-0.5 text-sm text-gray-400">
                            {m.director ? `Directed by ${m.director}` : 'Director unknown'}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                            {watched && <span>Watched {watched}</span>}
                            {review.rewatch && (
                                <span className="rounded bg-gray-700/70 px-1.5 py-0.5 text-gray-300">Rewatch</span>
                            )}
                            {review.liked && <span className="text-rose-400">♥ Liked</span>}
                        </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <div className="font-display text-xl font-bold leading-none text-indigo-400 sm:text-2xl">
                            {review.rating}
                        </div>
                        <div className="mt-1">
                            <StarRating value={review.rating} size={12} />
                        </div>
                    </div>
                </div>
                {review.comment ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-200">{review.comment}</p>
                ) : null}
            </div>
        </article>
    );
}
