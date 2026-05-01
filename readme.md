# Vapour FT

A peer-to-peer digital asset marketplace built for INF1005 Web Systems and Technologies (Singapore Institute of Technology). Users can buy, sell, and trade digital collectibles using an in-platform wallet backed by a double-entry ledger.



---

## Architecture

Vapour FT uses a **Multi-Page Application + Islands Architecture** pattern. PHP Slim handles all page routing and server-side rendering. React components are isolated interactive widgets ("islands") mounted into specific PHP views — they do not share state and independently fetch data from the JSON API. No React Router is used.

```
Browser → Apache → PHP Slim (SSR page) → PHP view with <div data-island>
                                                 ↓
                              React island mounts, calls /api/v1/...
                                                 ↓
                                     MySQL 8.0 (InnoDB)
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.2, Slim Framework 4 |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Database | MySQL 8.0 (InnoDB, DECIMAL financials) |
| Container | Docker (3-stage build), Docker Compose |
| Deployment | GCP Compute Engine e2-small, Ubuntu 22.04 |
| CI/CD | GitHub Actions → SSH deploy on push to `main` |

---

## Key Features

**Marketplace**
- Browse listings with search, rarity filter, and price sort (`ListingsGrid` island)
- Atomic buy flow: `SELECT ... FOR UPDATE` → balance check → transfer → `COMMIT` or `ROLLBACK`
- Sell from portfolio, cancel active listings

**Wallet & Ledger**
- Double-entry ledger — every transaction writes two rows (debit + credit)
- Row-level locking prevents race conditions on concurrent purchases
- `DECIMAL(10,2)` throughout — no floating point for financials

**Auth & Security**
- Session-based authentication with PHP's `password_hash()` / `password_verify()`
- CSRF token middleware on all state-changing routes
- RBAC middleware: `AuthMiddleware`, `AdminMiddleware`
- Parameterised PDO queries throughout — no raw interpolation

**Dashboard**
- Portfolio value chart, rarity breakdown, transaction history, active listings manager — all React islands fetching from `/api/v1/`

**Admin**
- Manage all listings and blog posts via protected `/admin` panel

---

## Database Schema

8 InnoDB tables: `users`, `wallets`, `wallet_ledger`, `assets`, `inventory`, `listings`, `transactions`, `blog_posts`. Composite indexes on `listings(status, price)` and `wallet_ledger(wallet_id, created_at)`. Schema and seed data in `database/init.sql`.

---

## CI/CD Pipeline

Every push to `main` triggers a GitHub Actions workflow:

1. SSH into GCP via `appleboy/ssh-action`
2. `git pull origin main`
3. `docker compose -f docker-compose.prod.yml up -d --build`
4. `docker image prune -f`
5. Health check against `http://localhost:8000`

No volume mounts in production. Static assets are baked into the image at build time.

**Known limitations:** health check uses a fixed `sleep 5` delay; no rollback mechanism; no staging environment; full layer rebuild on every deploy.

---

## Local Setup

Requires Docker Desktop and Git.

```bash
git clone https://github.com/your-org/vapour-ft.git
cd vapour-ft

cp .env.example .env
# Set MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD

docker compose up --build
```

| Service | URL |
|---|---|
| App (Apache + PHP) | http://localhost:8000 |
| Vite HMR (dev only) | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 |

The database initialises automatically from `database/init.sql` on first start.

**Test accounts** (password: `Password1`)

```
admin@vapourft.com    # admin role
user@vapourft.com     # regular user
```

---

## Project Structure

```
vapour-ft/
├── backend/
│   └── src/
│       ├── Controllers/     # Thin controllers — delegate to services
│       ├── Services/        # Business logic (MarketService, WalletService, ...)
│       ├── Repositories/    # PDO queries (ListingRepository, ...)
│       ├── Middleware/       # AuthMiddleware, AdminMiddleware, CsrfMiddleware
│       └── Views/           # PHP templates (layout.php, partials)
├── frontend/
│   └── src/
│       ├── islands/         # React island components
│       ├── components/      # Shared UI primitives
│       └── main.jsx         # Island mounting entry point
├── database/
│   └── init.sql             # Schema + seed data
├── docker-compose.yml
├── docker-compose.prod.yml
├── Dockerfile
└── deploy.sh
```

---

## Validation

HTML compliance is verified against the [W3C Nu Html Checker API](https://validator.w3.org/nu/). A Python script (`tools/w3c_check.py`) fetches each live page and POSTs the HTML to the validator API, printing any errors or warnings per URL. Run it against the live deployment before submission.

---

## Known Limitations

- All island code ships in a single Vite bundle — no route-based code splitting
- Home page runs live `SUM`/`COUNT` aggregations on every request — no caching layer
- `AdminController` queries the database directly, bypassing the service layer
- Apache makes SSE impractical in the current stack; dashboard uses polling

---

## Team

Built by a 5-person team at Singapore Institute of Technology for INF1005 Web Systems and Technologies.
