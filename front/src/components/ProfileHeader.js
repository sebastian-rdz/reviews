import React from 'react';

export default function ProfileHeader({ title = 'My Reviews', user, onOpenForm }) {
    return (
        <div className="sticky top-0 z-30 border-b border-gray-700/60 bg-gray-950/80 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                <img
                    src={'https://sebastianrdz.com/assets/images/cv.jpg'}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/70 ring-offset-2 ring-offset-gray-950"
                />
                <div className="min-w-0">
                    <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
                        {title}
                    </h1>
                    <p className="text-xs text-gray-400">A personal film diary</p>
                </div>
                <div className="ml-auto">
                    {user ? (
                        <button
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950"
                            onClick={onOpenForm}
                        >
                            <span className="text-base leading-none">+</span> Write review
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
