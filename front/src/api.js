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
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  
  const url = `${API_BASE}/reviews${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const res = await fetch(url);
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Create a new review
export async function createReview(payload) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload)
  });
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Search movies by title
export async function searchMovies(query) {
  const url = `${API_BASE}/movies/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Create a movie from TMDB ID
export async function createMovieFromTmdb(tmdb_id) {
  const res = await fetch(`${API_BASE}/movies/from-tmdb`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ tmdb_id })
  });
  const data = await parseTextResponse(res);
  if (!res.ok) throw new Error(typeof data === 'string' ? data : (data.message || JSON.stringify(data)));
  return data;
}

// Get favorites movies
export async function fetchFavoriteMovies() {
  const res = await fetch(`${API_BASE}/movies/favorites`);
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    return data;
  } catch {
    throw new Error(`Invalid response from favorites: ${text.slice(0,200)}`);
  }
}

// yap yap yap
function setToken(token) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}
function getToken() {
  return localStorage.getItem('auth_token');
}
function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function parseTextResponse(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}
