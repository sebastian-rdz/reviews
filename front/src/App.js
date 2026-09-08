import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import './index.css';
import { login, logout, isAuthed } from './api';
import NavBar from './components/NavBar';
import ReviewModal from './components/ReviewModal';

export default function App() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('authUser'));
        } catch {
            return null;
        }
    });
    const authed = Boolean(user) && isAuthed();

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [password, setPassword] = useState('');
    const [err, setErr] = useState(null);

    const [reviewModal, setReviewModal] = useState({ open: false, movie: null });
    const [dataVersion, setDataVersion] = useState(0);
    const bumpData = useCallback(() => setDataVersion((v) => v + 1), []);

    const openReviewModal = useCallback((movie = null) => setReviewModal({ open: true, movie }), []);
    const closeReviewModal = useCallback(() => setReviewModal({ open: false, movie: null }), []);

    async function handleLogin(e) {
        e?.preventDefault();
        try {
            const data = await login({ username: 'admin', password });
            const u = data.user || { username: 'admin' };
            setUser(u);
            localStorage.setItem('authUser', JSON.stringify(u));
            setPassword('');
            setShowLoginModal(false);
            setErr(null);
        } catch (error) {
            setErr(String(error.message || error));
        }
    }

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            // ignore
        } finally {
            setUser(null);
            localStorage.removeItem('authUser');
        }
    }

    const ctx = {
        user,
        authed,
        dataVersion,
        openReviewModal,
        openLogin: () => setShowLoginModal(true),
        logout: handleLogout,
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 antialiased">
            <NavBar authed={authed} onLog={() => openReviewModal(null)} />

            <main>
                <Outlet context={ctx} />
            </main>

            <footer className="mt-8 border-t border-gray-800 py-6 text-center">
                <button className="text-sm text-gray-500 transition-colors hover:text-gray-300" onClick={handleLogout}>
                    {new Date().getFullYear()}
                </button>
                <span className="mx-2 text-gray-700">·</span>
                <button
                    className="text-sm text-gray-500 transition-colors hover:text-gray-300"
                    onClick={() => setShowLoginModal(true)}
                >
                    Sebastian Rodriguez
                </button>
            </footer>

            <ReviewModal
                open={reviewModal.open}
                movie={reviewModal.movie}
                onClose={closeReviewModal}
                onCreated={bumpData}
            />

            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />
                    <div className="relative z-10 w-full max-w-sm rounded-xl border border-gray-700/60 bg-gray-800 p-6 text-white shadow-card-hover">
                        <form onSubmit={handleLogin} className="space-y-3">
                            <input
                                className="w-full rounded-lg border border-gray-600 bg-gray-900/60 px-3 py-2.5 text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                        {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
