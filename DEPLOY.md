# Deploy runbook

Hosting: Apache / cPanel-style, **SFTP only (no shell)**.

- Frontend → `reviews.sebastianrdz.com` (document root of that domain)
- Backend  → `api.sebastianrdz.com` (document root points at `back/public`)

---

## One-time setup

### Production `.env` (backend) — keep this **on the server**, never in the zip

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_KEY=            # keep the existing one
APP_URL=https://api.sebastianrdz.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...

SESSION_DRIVER=file            # simplest; avoids needing a sessions table

TMDB_API_KEY=...               # required — the app can't add new films without it
CORS_ALLOWED_ORIGINS=https://reviews.sebastianrdz.com
```

### Frontend build config

`front/.env.production` (committed) already sets:

```
REACT_APP_API_BASE=https://api.sebastianrdz.com/api
```

---

## Every deploy

### 1. Frontend

```bash
cd front
npm ci
npm run build          # picks up .env.production automatically
```

Upload the **contents** of `front/build/` to the `reviews.sebastianrdz.com` folder
(overwrite everything, including the `.htaccess` — it does the SPA routing).

⚠️ Make sure the old hashed `static/` files get removed or the folder just grows.

### 2. Backend

Before zipping `back/`, delete local-only cruft so it doesn't overwrite prod:

```bash
rm -f back/bootstrap/cache/*.php      # stale config/route cache = points at localhost
rm -f back/database/database.sqlite   # local db
rm -rf back/storage/logs/*
```

Do **not** include `back/.env` in the zip (prod has its own).

Upload the `back/` files to `api.sebastianrdz.com`. `vendor/` is included in the
zip, so no `composer install` needed on the server.

### 3. Run migrations (no shell — pick one)

**A. cPanel → Cron Jobs** (most reliable): add a job, let it run once, delete it.

```
/usr/local/bin/php /home/<user>/api.sebastianrdz.com/artisan migrate --force
```

**B. cPanel → Terminal** (many plans have it even without "SSH", under Advanced):

```bash
cd ~/api.sebastianrdz.com && php artisan migrate --force
```

**C. Token endpoint** (if we add it — see below): hit
`POST https://api.sebastianrdz.com/api/_deploy/migrate` with the secret header.

This branch adds 3 migrations: movie detail fields, `reviews.watched_on/liked/rewatch`,
`watchlist_items` table. They're additive — rollback is `migrate:rollback --step=3`.

### 4. Config cache

Don't run `config:cache` / `route:cache` on shared hosting unless you can also
clear them. If `back/bootstrap/cache/` has no `*.php` files, Laravel reads `.env`
and routes live — which is fine for this app.

---

## Post-deploy smoke test

1. Open `/`, then hard-refresh on `/diary`, `/watchlist`, `/stats`, `/film/1`
   → must load, not 404 (proves `.htaccess`).
2. Log in (footer → password).
3. Search a film that isn't logged yet → select → save review → shows in Journal.
4. Add a film to the watchlist from the search box.
5. `/stats` loads.
6. Open an older film page → backdrop/cast/runtime auto-fill from TMDB on first view.

---

## Never do in production

- `php artisan db:seed` / `migrate --seed` — the demo seeders (`MovieSeeder`,
  `ReviewSeeder`) are guarded to skip when `APP_ENV=production`, but don't tempt it.
- Upload `back/.env` from local.
- Ship `back/bootstrap/cache/*.php` from local.
