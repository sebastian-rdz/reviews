/*
  PLEASE FOR THE LOVE OF GOD CHANGE API_BASE TO YOUR DEVICE'S IP THANKS
  - sebastian
*/

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000/api';
// const API_BASE = 'https://api.sebastianrdz.com/api';
export default API_BASE;

// User login
export async function login({ username, password }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  if (data.token) setToken(data.token);
  return data;
}

// User logout
export async function logout() {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() }
    });
  } catch (e) {
    console.debug('logout backend call failed', e);
  }
  setToken(null);
}

// Get all reviews
export async function fetchReviews(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.per_page) queryParams.append('per_page', params.per_page);
  if (params.search) queryParams.append('search', params.search);
  if (params.min_rating) queryParams.append('min_rating', params.min_rating);
  if (params.year && params.year !== 'all') queryParams.append('year', params.year);
  if (params.genre && params.genre !== 'all') queryParams.append('genre', params.genre);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.liked) queryParams.append('liked', '1');

  const url = `${API_BASE}/reviews${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return getJson(url);
}

// Chronological diary feed (grouped by month on the client)
export async function fetchDiary(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.min_rating) queryParams.append('min_rating', params.min_rating);
  if (params.year && params.year !== 'all') queryParams.append('year', params.year);
  if (params.genre && params.genre !== 'all') queryParams.append('genre', params.genre);
  if (params.liked) queryParams.append('liked', '1');
  const url = `${API_BASE}/reviews/diary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return getJson(url);
}

// One film + its reviews + aggregate stats
export async function fetchMovie(id) {
  return getJson(`${API_BASE}/movies/${id}`);
}

// Profile-wide stats
export async function fetchStats(year) {
  const q = year ? `?year=${year}` : '';
  return getJson(`${API_BASE}/stats${q}`);
}

// Create a new review
export async function createReview(payload) {
  return sendJson(`${API_BASE}/reviews`, 'POST', payload);
}

// Search movies by title
export async function searchMovies(query) {
  return getJson(`${API_BASE}/movies/search?query=${encodeURIComponent(query)}`);
}

// Create a movie from TMDB ID
export async function createMovieFromTmdb(tmdb_id) {
  return sendJson(`${API_BASE}/movies/from-tmdb`, 'POST', { tmdb_id });
}

// Get favorites movies
export async function fetchFavoriteMovies() {
  return getJson(`${API_BASE}/movies/favorites`);
}

// --- Watchlist ---
export async function fetchWatchlist() {
  return getJson(`${API_BASE}/watchlist`);
}

export async function addToWatchlist(payload) {
  // payload: { movie_id } or { tmdb_id }
  return sendJson(`${API_BASE}/watchlist`, 'POST', payload);
}

export async function removeFromWatchlist(movieId) {
  return sendJson(`${API_BASE}/watchlist/${movieId}`, 'DELETE');
}

// --- helpers ---
function setToken(token) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}
function getToken() {
  return localStorage.getItem('auth_token');
}
export function isAuthed() {
  return !!getToken();
}
function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseTextResponse(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

// A dead/expired token: drop the stored session so the UI stops showing us as
// logged in. Next render / refresh reflects the logged-out state.
function handleAuthExpiry(res) {
  if (res.status === 401) {
    setToken(null);
    localStorage.removeItem('authUser');
  }
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json', ...authHeader() } });
  const data = await parseTextResponse(res);
  if (!res.ok) {
    handleAuthExpiry(res);
    throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  }
  return data;
}

async function sendJson(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader() },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await parseTextResponse(res);
  if (!res.ok) {
    handleAuthExpiry(res);
    throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  }
  return data;
}
