import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import HomePage from './pages/HomePage';
import FilmPage from './pages/FilmPage';
import DiaryPage from './pages/DiaryPage';
import WatchlistPage from './pages/WatchlistPage';
import StatsPage from './pages/StatsPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<App />}>
                    <Route index element={<HomePage />} />
                    <Route path="film/:id" element={<FilmPage />} />
                    <Route path="diary" element={<DiaryPage />} />
                    <Route path="watchlist" element={<WatchlistPage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="*" element={<HomePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
