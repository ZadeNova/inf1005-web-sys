# Vapour FT — Digital Asset Marketplace

A Steam-style digital asset marketplace built with PHP Slim, React, and MySQL.

---

## Requirements

Before you start, make sure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

> ⚠️ **Make sure Docker Desktop is open and running** before proceeding.

---

## First-Time Setup

Follow these steps **once** when you first clone the repo.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/web-sys.git
cd web-sys
```

### 2. Create your `.env` file

**Mac / Linux:**

```bash
cp .env.example .env
```

**Windows (Command Prompt):**

```cmd
copy .env.example .env
```

> ⚠️ **Do not skip this step.** Docker will fail to start without a `.env` file.  
> The `.env` file is intentionally not committed to Git — every teammate must create their own copy.

### 3. Start the app

```bash
docker compose up --build
```

The first build will take **1-2 minutes** as Docker downloads images and installs dependencies. Subsequent startups will be much faster (~10-15 seconds).

Once everything is ready, Docker will print the available services:

```
========================================
        VAPOUR FT -- DEV SERVERS
========================================

  Frontend (Vite)  ->  http://localhost:3000
  Backend (Nginx)  ->  http://localhost:8000
  phpMyAdmin (DB)  ->  http://localhost:8080
  MySQL (raw)      ->  localhost:3306

========================================
```

---

## Dev Servers

| Service         | URL                   | Description                        |
| --------------- | --------------------- | ---------------------------------- |
| Frontend (Vite) | http://localhost:3000 | React dev server with hot reload   |
| Backend (Nginx) | http://localhost:8000 | PHP Slim API + rendered pages      |
| phpMyAdmin      | http://localhost:8080 | Visual database browser            |
| MySQL           | localhost:3306        | Raw DB access (TablePlus, DBeaver) |

---

## Viewing the Database

Open **http://localhost:8080** in your browser to access phpMyAdmin.

Login credentials:

- **Username:** `vapourft_user`
- **Password:** `vapourft_pass`
- **Database:** `vapourft`

---

## Daily Workflow

### Starting the app

```bash
docker compose up
```

> Only use `--build` if you added new dependencies (composer or npm packages) or changed a Dockerfile.

### Stopping the app

```bash
docker compose down
```

### Pulling the latest changes from Git

```bash
git pull
docker compose up --build
```

> Use `--build` after a `git pull` to ensure any new dependencies are installed.

---

## Viewing Logs

To tail all service logs in real time:

```bash
docker compose logs -f
```

To view logs for a specific service:

```bash
docker compose logs -f php
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f mysql
```

---

## Common Issues

### Docker says a port is already in use

Another app on your machine is using port `3000`, `8000`, `8080`, or `3306`. Stop that app, then retry.

### `docker compose up` fails with "missing variable"

You skipped step 2. Create your `.env` file from `.env.example` and try again.

### Frontend shows "Cannot find module"

Run `docker compose down` then `docker compose up --build` to force a clean reinstall of `node_modules`.

### Database is empty after pulling changes

If new migrations or seed data were added to `database/init.sql`, you need to reset the database volume:

```bash
docker compose down -v
docker compose up --build
```

> ⚠️ `down -v` **wipes your local database**. Only run this when you intentionally want a fresh DB.

---

## Project Structure

```
web-sys/
├── backend/          # PHP Slim application (routes, controllers, services)
├── frontend/         # React + Vite (island components)
├── public/           # Entry point (index.php + compiled assets)
├── database/         # init.sql schema and seed data
├── docker/           # Nginx config, PHP Dockerfile
├── docker-compose.yml
├── .env.example      # Copy this to .env
└── README.md
```

---

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React 19, Vite, Tailwind CSS |
| Backend    | PHP 8.2, Slim 4, PHP-DI      |
| Database   | MySQL 8.0                    |
| Web Server | Nginx (Alpine)               |
| Dev Tools  | Docker, phpMyAdmin           |
