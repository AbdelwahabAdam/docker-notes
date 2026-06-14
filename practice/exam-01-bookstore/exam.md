# Docker Practice Exam 1 — Online Bookstore

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-01-bookstore/` — run all commands from this directory.

---

## How to read each task

| Section | Meaning |
|---------|---------|
| **Goal** | What skill this task tests |
| **Scenario** | Real-world reason for the task |
| **Provided files** | Files already in this folder |
| **What you must do** | Numbered steps — complete all of them |
| **Settings table** | Exact image, container name, ports — use these values |
| **How to verify** | Commands to confirm success |
| **Answer** | Solution — try first, then compare |

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-01-bookstore`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The bookstore team needs a quick catalog gateway page while the full storefront is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `bookstore-web` |
| Port mapping (host:container) | `9080:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=bookstore-web
curl http://localhost:9080
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name bookstore-web \
  -p 9080:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=bookstore-web
curl http://localhost:9080
```

---

## Task 2 — Image Creation (landing page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered a static landing page. Package it into an image so anyone can run the same page without copying files manually.

### Provided files

| File | Description |
|------|-------------|
| `landing.html` | Bookstore landing page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `landing.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`bookstore-landing:v1`**.
5. Run a container named **`bookstore-landing`** from that image on port **`9081:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `bookstore-landing:v1` |
| Container name | `bookstore-landing` |
| Port mapping | `9081:80` |

### How to verify

```bash
docker images bookstore-landing
curl http://localhost:9081
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY landing.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t bookstore-landing:v1 .
docker run -d --name bookstore-landing -p 9081:80 bookstore-landing:v1
curl http://localhost:9081
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Book inventory data must not be lost when the storage container is replaced.

### What you must do

1. Create a named volume called **`bookstore-data`**.
2. Start container **`bookstore-storage1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`bookstore-data`** at **`/data`** inside the container.
4. Inside the container, create file **`/data/inventory.txt`** with content: `title=Docker Deep Dive;qty=42`
5. Exit, then **remove** container `bookstore-storage1` completely.
6. Start a **new** container **`bookstore-storage2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `bookstore-storage2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `bookstore-data` |
| Mount path (inside container) | `/data` |
| First container name | `bookstore-storage1` |
| Second container name | `bookstore-storage2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect bookstore-data
docker exec bookstore-storage2 cat /data/inventory.txt
```

### Answer

```bash
docker volume create bookstore-data

docker run -it --name bookstore-storage1 \
  -v bookstore-data:/data \
  ubuntu:22.04
# inside container:
echo "title=Docker Deep Dive;qty=42" > /data/inventory.txt
exit

docker rm -f bookstore-storage1

docker run -it --name bookstore-storage2 \
  -v bookstore-data:/data \
  ubuntu:22.04
# inside container:
cat /data/inventory.txt
exit
```

---

## Task 4 — Host Bind Mount (live catalog)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Editors update catalog pages on their laptop. Nginx should serve those files directly from disk during development.

### Provided files

| File | Description |
|------|-------------|
| `live-catalog.html` | Live catalog page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-01-bookstore/`), copy `live-catalog.html` to a new file named **`index.html`**:
   ```bash
   cp live-catalog.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new book title).
6. Run `curl http://localhost:9082` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `bookstore-live` |
| Port mapping (host:container) | `9082:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-01-bookstore` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name bookstore-live
-p 9082:80
-v <HOST_PATH_TO_exam-01-bookstore>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9082
docker ps --filter name=bookstore-live
# edit index.html on host, then:
curl http://localhost:9082
```

### Answer

```bash
cp live-catalog.html index.html

docker run -d \
  --name bookstore-live \
  -p 9082:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-01-bookstore:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9082
# edit index.html on host, then:
curl http://localhost:9082
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The catalog API must connect to the database container using the hostname `bookstore-db` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`bookstore-net`**.
2. Start **`bookstore-db`** from image **`ubuntu:22.04`** on network `bookstore-net` (detached + TTY: `-dit`).
3. Start **`bookstore-api`** from image **`ubuntu:22.04`** on network `bookstore-net` (detached + TTY: `-dit`).
4. Inside `bookstore-api`, verify hostname **`bookstore-db`** resolves (use `getent hosts bookstore-db` or `ping bookstore-db` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `bookstore-net` |
| DB container name | `bookstore-db` |
| DB image | `ubuntu:22.04` |
| API container name | `bookstore-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect bookstore-net
docker exec bookstore-api getent hosts bookstore-db
```

### Answer

```bash
docker network create bookstore-net

docker run -dit \
  --name bookstore-db \
  --network bookstore-net \
  ubuntu:22.04

docker run -dit \
  --name bookstore-api \
  --network bookstore-net \
  ubuntu:22.04

docker exec bookstore-api getent hosts bookstore-db
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The bookstore app reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`bookstore-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=staging`
   - `DB_HOST=bookstore-db`
   - `DB_PORT=5432`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `bookstore-env` |
| `APP_ENV` | `staging` |
| `DB_HOST` | `bookstore-db` |
| `DB_PORT` | `5432` |

### How to verify

```bash
docker exec bookstore-env printenv APP_ENV DB_HOST DB_PORT
```

### Answer

```bash
docker run -dit \
  --name bookstore-env \
  -e APP_ENV=staging \
  -e DB_HOST=bookstore-db \
  -e DB_PORT=5432 \
  ubuntu:22.04

docker exec bookstore-env printenv APP_ENV DB_HOST DB_PORT
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + database) in one YAML file.

### Scenario

Deploy the bookstore staging stack: nginx frontend and PostgreSQL database.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define two services: **`web`** and **`db`**.
3. Declare a named volume for PostgreSQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9083:80` | on network `bookstore-compose-net` |
| `db` | `postgres:15-alpine` | (none on host) | user `bookstore`, password `bookstore123`, db `books`, volume `bookstore-pg:/var/lib/postgresql/data` |

| Resource | Name |
|----------|------|
| Volume | `bookstore-pg` |
| Network | `bookstore-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9083
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9083:80"
    networks:
      - bookstore-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: bookstore123
      POSTGRES_USER: bookstore
      POSTGRES_DB: books
    volumes:
      - bookstore-pg:/var/lib/postgresql/data
    networks:
      - bookstore-compose-net

volumes:
  bookstore-pg:

networks:
  bookstore-compose-net:
```

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
```

---

## Task 8 — Troubleshooting (container exits immediately)

### Goal

Find **why** a container exits and fix it so it stays running.

### Scenario

Container `bookstore-broken` was started incorrectly and exits right away.

### Provided files

| File | Description |
|------|-------------|
| `broken-command.sh` | Shows the broken `docker run` command for reference |

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name bookstore-broken ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs bookstore-broken`, and `docker inspect bookstore-broken` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`bookstore-broken-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `bookstore-broken` |
| Fixed container name | `bookstore-broken-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=bookstore-broken-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name bookstore-broken ubuntu:22.04
docker ps -a --filter name=bookstore-broken
docker logs bookstore-broken

docker rm -f bookstore-broken
docker run -dit --name bookstore-broken-fixed ubuntu:22.04
docker ps --filter name=bookstore-broken-fixed
```

`root-cause.txt`:

```text
Container exited because ubuntu:22.04 has no foreground process when run without -dit.
```

---

## Task 9 — Security (non-root user)

### Goal

Build an image that runs as a **non-root** Linux user.

### Scenario

Security policy forbids running application containers as root.

### What you must do

1. Create **`Dockerfile.secure`** using base image **`ubuntu:22.04`**.
2. Create Linux user **`bookuser`** inside the image.
3. Add `USER bookuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`bookstore-secure:v1`**, run container **`bookstore-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `bookuser` |
| Image tag | `bookstore-secure:v1` |
| Container name | `bookstore-secure` |

### How to verify

```bash
docker exec bookstore-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m bookuser
USER bookuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t bookstore-secure:v1 .
docker run -d --name bookstore-secure bookstore-secure:v1
docker exec bookstore-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready bookstore edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |
| `prod-env.example` | Reference env vars for production |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `bookuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env `APP_ENV=production`, volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9084:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `bookstore-prod-data` mounted at `/data` |
| Network | `bookstore-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `bookuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9084
docker volume ls | grep bookstore-prod
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D bookuser
USER bookuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

`docker-compose.prod.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    ports:
      - "9084:8080"
    environment:
      APP_ENV: production
    volumes:
      - bookstore-prod-data:/data
    networks:
      - bookstore-prod-net

volumes:
  bookstore-prod-data:

networks:
  bookstore-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9084
```

---
