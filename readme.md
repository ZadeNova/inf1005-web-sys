# Vapour FT

A peer-to-peer digital asset marketplace for rare collectibles. Built with PHP Slim, React, and MySQL for INF1005 at the Singapore Institute of Technology.


---

## The Tech Stack

| Layer | Tech |
|---|---|
| Backend | PHP 8.2, Slim 4.15.1, PHP-DI 7.1.1 |
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Database | MySQL 8.0 |
| Auth | delight-im/auth v9 + custom session middleware |
| Infrastructure | Docker, Apache, GCP Compute Engine (e2-small) |
| CI/CD | GitHub Actions + SSH deploy on push to `main` |

---

## Architecture

The app is a **Multi-Page Application with Islands Architecture**. PHP Slim handles all routing and renders HTML page shells. React components mount as isolated widgets inside specific pages and fetch their own data from the JSON API independently.

There is no React Router. Adding a page means adding a Slim route, a PHP view, and a controller method. This kept the frontend and backend cleanly separated across a 5-person team.

The backend follows a **Service-Repository-Controller** pattern. Controllers parse requests and return responses. Services own business logic. Repositories own all SQL.

```
backend/src/
├── Controllers/    -- thin, delegates to services
├── Services/       -- business logic (auth, market, wallet)
├── Repositories/   -- all PDO queries
├── Middleware/      -- auth, CSRF, admin, security headers
└── Views/          -- PHP templates with island mount points
```

---

## Key Features

**Atomic transactions with row locking**

Every purchase runs inside a single database transaction with `SELECT ... FOR UPDATE`. Both wallet rows are locked in ascending user ID order before any balance is read or written. This prevents race conditions and deadlocks. If the listing is already sold by the time the lock is acquired, the transaction rolls back.

**Double-entry wallet ledger**

Every debit has a matching credit in `wallet_ledger`, both sharing a transaction reference. The table is append-only. Each row stores `balance_before` and `balance_after` so the full balance history is reconstructable without summing.

**CSRF protection**

All state-changing API calls require an `X-CSRF-Token` header validated with `hash_equals()` against the session token. The token is embedded in every page via a `<meta>` tag and read automatically by the shared `useApi.js` hook.

**Security headers**

`SecurityHeadersMiddleware` adds `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Content-Security-Policy` to every response.

**W3C compliant**

All 8 public routes pass the W3C Nu Validator with zero errors, verified against the live URL.

---

## CI/CD

Every push to `main` triggers an automated deployment to GCP with no manual steps.

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

steps:
  - uses: appleboy/ssh-action@v1.0.3
    with:
      host: ${{ secrets.VM_HOST }}
      username: ${{ secrets.VM_USER }}
      key: ${{ secrets.SSH_PRIVATE_KEY }}
      script: cd ~/inf1005-web-sys && bash deploy.sh
```

The deploy script on the server:

```bash
# deploy.sh
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
docker image prune -f

sleep 5

# Gate -- if the app is not responding, the pipeline fails
curl -f http://localhost || { echo "Health check failed"; exit 1; }
```

Push to `main` -> GitHub Actions -> SSH into GCP -> Docker rebuild -> health check gate. The live URL has been running throughout development.

**Limitations**

- `sleep 5` is a fixed wait, not a proper readiness check. If the container takes longer than 5 seconds to start (slow MySQL init, large image), the health check runs too early and the pipeline reports a false failure.
- No rollback. If the health check fails, the broken container is left running. A proper setup would tag images by commit SHA and re-run the previous tag on failure.
- The pipeline deploys directly to production. There is no staging environment. A bad push goes live immediately.
- `--no-cache` on every build means full layer rebuilds every deploy. Fine for a small image but slow. Layer caching with a registry like Artifact Registry would cut build time significantly.

## Database

9 InnoDB tables. All financial columns are `DECIMAL(10,2)`.

```
users -- wallets
      -- wallet_ledger
      -- bank_accounts
      -- inventory -- listings -- transactions
      -- blog_posts

assets -- inventory
```

---

## Limitations

- Wallet balance uses 10-second polling. SSE ( server sent events ) would be cleaner but Apache's synchronous model makes persistent connections difficult without Swoole.
- All island code ships in a single Vite bundle. Every page downloads components it doesn't use. Route-based code splitting would fix this.
- The home page runs live `SUM`/`COUNT` aggregations on every request. Fine at this scale, but a Redis cache would be needed under real load.
- `AdminController` queries the database directly instead of going through a service layer, inconsistent with the rest of the codebase.

---

## Local Setup

Requires Docker Desktop and Git.

```bash
git clone https://github.com/your-org/vapour-ft.git
cd vapour-ft

cp .env.example .env
# fill in MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD

docker compose up --build
```

| Service | URL |
|---|---|
| App (Apache) | http://localhost:8000 |
| Frontend (Vite HMR) | http://localhost:3000 |
| phpMyAdmin | http://localhost:8080 |

The database seeds automatically on first start via `database/init.sql`.

**Test accounts** (password: `Password1`)

```
admin@vapourft.com   -- admin role
user@vapourft.com    -- regular user
```

---

