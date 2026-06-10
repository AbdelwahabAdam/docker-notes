# Docker Practice Exam 1 — Online Bookstore

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Concepts:** All 10 core Docker topics  
**Workspace:** This folder — [questions.md](./questions.md) · [answers.md](./answers.md)

> Run commands from `exam-01-bookstore/`. Windows bind mounts: `G:/Devops_Hopa/Docker/practice/exam-01-bookstore/taskXX/`  

---

## Task 1 — Container Deployment

### Scenario

The bookstore team needs a temporary catalog web server for a demo.

### Required

1. Pull image **`nginx:1.25-alpine`** (if not present locally).
2. Run a container named **`bookstore-web`** from that image.
3. Publish container port **`80`** to host port **`9080`** (`9080:80`).
4. Set restart policy to **`unless-stopped`**.
5. Run detached (`-d`).
6. Verify with `docker ps` — status must be **Up**.

### Verify

```bash
docker ps --filter name=bookstore-web
curl http://localhost:9080
```

---

## Task 2 — Image Creation (FE)

### Scenario

The designer delivered a static landing page. Build and deploy it as a custom image.

### Provided files

| File | Purpose |
|------|---------|
| `task02-landing/index.html` | Frontend landing page |

### Required

1. Create **`task02-landing/Dockerfile`** (*student-created*).
2. Base image: **`nginx:1.25-alpine`**.
3. Copy `index.html` to **`/usr/share/nginx/html/index.html`**.
4. Build from `task02-landing/` directory:
   - Image name: **`bookstore-landing`**
   - Tag: **`v1`**
   - Full reference: `bookstore-landing:v1`
5. Run container **`bookstore-landing`**, detached, port **`9081:80`**.

### Verify

```bash
docker images bookstore-landing
curl http://localhost:9081
```

---

## Task 3 — Persistent Storage

### Scenario

Book inventory data must survive container recreation.

### Required

1. Create a named volume: **`bookstore-data`**.
2. Run **`ubuntu:22.04`** container **`bookstore-storage1`**:
   - Mount `bookstore-data` at **`/data`**
   - Interactive terminal (`-it`) for initial setup
3. Inside the container, create **`/data/inventory.txt`** with content:
   ```text
   title=Docker Deep Dive;qty=42
   ```
4. Stop and remove **`bookstore-storage1`** (`docker rm -f`).
5. Run **`bookstore-storage2`** (`ubuntu:22.04`, same volume mount at `/data`).
6. Confirm **`/data/inventory.txt`** still exists and content is intact.

### Verify

```bash
docker volume inspect bookstore-data
docker exec bookstore-storage2 cat /data/inventory.txt
```

---

## Task 4 — Host Bind Mount (FE live edit)

### Scenario

Editors update catalog pages on the host without rebuilding images.

### Provided files

| File | Purpose |
|------|---------|
| `task04-live/index.html` | Live catalog page (edit on host) |

### Required

1. Use host directory **`task04-live/`** (do not copy elsewhere).
2. Run **`nginx:1.25-alpine`** container **`bookstore-live`**:
   - Port **`9082:80`**
   - Bind mount: `task04-live/` → **`/usr/share/nginx/html`**
3. On the **host**, edit `index.html` — add a new book title to the list.
4. Refresh browser/`curl` — change must appear **without** `docker build`.

### Verify

```bash
curl http://localhost:9082
# edit index.html on host, then:
curl http://localhost:9082
```

---

## Task 5 — Networking

### Scenario

A catalog API container must reach a database container by hostname.

### Required

1. Create bridge network **`bookstore-net`** (`docker network create`).
2. Run **`ubuntu:22.04`** container **`bookstore-db`** on `bookstore-net` (detached + interactive TTY: `-dit`).
3. Run **`ubuntu:22.04`** container **`bookstore-api`** on `bookstore-net` (`-dit`).
4. Inside **`bookstore-api`**, install `iputils-ping` and ping **`bookstore-db`** by name (not IP).

### Verify

```bash
docker network inspect bookstore-net
docker exec -it bookstore-api ping -c 3 bookstore-db
```

---

## Task 6 — Environment Variables

### Scenario

The bookstore app reads configuration from environment variables at runtime.

### Provided files

| File | Purpose |
|------|---------|
| `task06/.env.example` | Reference for expected variable names |

### Required

1. Run **`ubuntu:22.04`** container **`bookstore-env`** (`-dit`).
2. Set environment variables (inline `-e`):
   - `APP_ENV=staging`
   - `DB_HOST=bookstore-db`
   - `DB_PORT=5432`
3. Verify all three variables inside the container.

### Verify

```bash
docker exec bookstore-env printenv APP_ENV DB_HOST DB_PORT
```

---

## Task 7 — Docker Compose (FE + DB)

### Scenario

Deploy a web + database stack for the bookstore staging environment.

### Required

Create **`task07-compose/docker-compose.yml`** (*student-created*) with:

| Service | Image | Details |
|---------|-------|---------|
| `web` | **`nginx:1.25-alpine`** | Host port **`9083:80`**, on network `bookstore-compose-net` |
| `db` | **`postgres:15-alpine`** | Env: `POSTGRES_PASSWORD=bookstore123`, `POSTGRES_USER=bookstore`, `POSTGRES_DB=books` |

Additional requirements:

- Named volume **`bookstore-pg`** mounted at **`/var/lib/postgresql/data`** on `db`
- Custom network **`bookstore-compose-net`**
- Run from `task07-compose/`: `docker compose up -d`

### Verify

```bash
cd task07-compose
docker compose ps
docker compose logs db
```

---

## Task 8 — Troubleshooting

### Scenario

Container **`bookstore-broken`** starts and immediately exits.

### Required

1. Reproduce the issue by running:
   ```bash
   docker run --name bookstore-broken ubuntu:22.04
   ```
   (See also `task08-troubleshooting/broken-command.sh`.)
2. Use `docker ps -a`, `docker logs bookstore-broken`, and `docker inspect bookstore-broken` to diagnose.
3. Remove the broken container and start a replacement named **`bookstore-broken-fixed`** that **stays running**.
4. Write the root cause in one sentence in a file **`task08-troubleshooting/root-cause.txt`** (*student-created*).

### Expected root cause

Container exits because there is no long-running foreground process.

### Verify

```bash
docker ps --filter name=bookstore-broken-fixed
```

---

## Task 9 — Security (non-root)

### Scenario

Security policy requires the bookstore app to run as a non-root user.

### Required

1. Create **`task09-security/Dockerfile`** (*student-created*).
2. Base image: **`ubuntu:22.04`**.
3. Create Linux user **`bookuser`** (UID does not need to be specified).
4. Switch to **`bookuser`** with `USER bookuser`.
5. Default CMD: `["sleep", "infinity"]`.
6. Build **`bookstore-secure:v1`**, run container **`bookstore-secure`** (`-d`).
7. Verify UID is **not** `0` (root).

### Verify

```bash
docker exec bookstore-secure id
# Expected: uid=1000(bookuser) or similar, NOT uid=0(root)
```

---

## Task 10 — Production Deployment Challenge (FE + Compose)

### Scenario

Deploy a production-ready bookstore frontend with full Docker best practices.

### Provided files

| File | Purpose |
|------|---------|
| `task10-prod/fe/index.html` | Production FE page |
| `task10-prod/.env.example` | Reference env vars |

### Required — student-created files

Create all of the following under **`task10-prod/`**:

| File | Requirements |
|------|--------------|
| **`Dockerfile`** | Base **`nginx:1.25-alpine`**, copy `fe/`, non-root user **`bookuser`**, `HEALTHCHECK` using `wget -qO- http://localhost` or `curl -f http://localhost` |
| **`.dockerignore`** | Exclude `.env`, `docker-compose*.yml`, `.git` |
| **`docker-compose.yml`** | Service `app`: build `.`, restart **`unless-stopped`**, port **`9084:8080`**, env `APP_ENV=production`, volume **`bookstore-prod-data:/data`**, network **`bookstore-prod-net`** |

Compose must declare:

```yaml
volumes:
  bookstore-prod-data:
networks:
  bookstore-prod-net:
```

### Verify

```bash
cd task10-prod
docker compose up -d --build
docker ps
docker volume ls | grep bookstore-prod
docker network ls | grep bookstore-prod
docker inspect $(docker compose ps -q)
curl http://localhost:9084
```
