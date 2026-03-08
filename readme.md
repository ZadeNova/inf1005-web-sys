# Web Systems Project

## Requirements

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

> ⚠️ Make sure Docker Desktop is **open and running** before proceeding.

## Running the Project

**1. Clone the repo**

```bash
git clone https://github.com/yourusername/web-sys.git
cd web-sys
```

**2. Start the app**

```bash
docker compose up --build
```

**3. Open in browser**

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:8000 |

Go to http://localhost:8000

## Stopping the app

```bash
docker-compose down
```

## Pulling latest changes

```bash
git pull
docker-compose up --build
```
