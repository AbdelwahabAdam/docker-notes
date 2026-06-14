# Docker Practice Exam 4 — Photo Gallery Service

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-04-gallery/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-04-gallery`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The gallery team needs a quick web gateway while the full photo service is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `gallery-web` |
| Port mapping (host:container) | `9380:80` |
| Restart policy | `on-failure` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=gallery-web
curl http://localhost:9380
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name gallery-web \
  -p 9380:80 \
  --restart on-failure \
  nginx:1.25-alpine

docker ps --filter name=gallery-web
curl http://localhost:9380
```

---

## Task 2 — Image Creation (welcome page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered a welcome page. Package it into an image so anyone can run the same gallery landing page.

### Provided files

| File | Description |
|------|-------------|
| `welcome.html` | Gallery welcome page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `welcome.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`gallery-welcome:v1`**.
5. Run a container named **`gallery-welcome`** from that image on port **`9381:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `gallery-welcome:v1` |
| Container name | `gallery-welcome` |
| Port mapping | `9381:80` |

### How to verify

```bash
docker images gallery-welcome
curl http://localhost:9381
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t gallery-welcome:v1 .
docker run -d --name gallery-welcome -p 9381:80 gallery-welcome:v1
curl http://localhost:9381
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Album metadata must not be lost when the storage container is replaced.

### Provided files

| File | Description |
|------|-------------|
| `album-001.json` | Sample album metadata — use as reference for file content |

### What you must do

1. Create a named volume called **`gallery-meta`**.
2. Start container **`gallery-store1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`gallery-meta`** at **`/metadata`** inside the container.
4. Inside the container, create file **`/metadata/album-001.json`** with content from the provided file (or equivalent JSON).
5. Exit, then **remove** container `gallery-store1` completely.
6. Start a **new** container **`gallery-store2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `gallery-store2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `gallery-meta` |
| Mount path (inside container) | `/metadata` |
| First container name | `gallery-store1` |
| Second container name | `gallery-store2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect gallery-meta
docker exec gallery-store2 cat /metadata/album-001.json
```

### Answer

```bash
docker volume create gallery-meta

docker run -it --name gallery-store1 \
  -v gallery-meta:/metadata \
  ubuntu:22.04
# inside container (use provided album-001.json content or equivalent):
echo '{"album":1}' > /metadata/album-001.json
exit

docker rm -f gallery-store1

docker run -it --name gallery-store2 \
  -v gallery-meta:/metadata \
  ubuntu:22.04
# inside container:
cat /metadata/album-001.json
exit
```

---

## Task 4 — Host Bind Mount (public gallery)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Designers add photos and update the public gallery page on their laptop. Nginx should serve those files directly from disk.

### Provided files

| File | Description |
|------|-------------|
| `public-index.html` | Public gallery page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-04-gallery/`), copy `public-index.html` to a new file named **`index.html`**:
   ```bash
   cp public-index.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new photo caption).
6. Run `curl http://localhost:9382` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `gallery-public` |
| Port mapping (host:container) | `9382:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-04-gallery` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name gallery-public
-p 9382:80
-v <HOST_PATH_TO_exam-04-gallery>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9382
docker ps --filter name=gallery-public
# edit index.html on host, then:
curl http://localhost:9382
```

### Answer

```bash
cp public-index.html index.html

docker run -d \
  --name gallery-public \
  -p 9382:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-04-gallery:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9382
# edit index.html on host, then:
curl http://localhost:9382
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The gallery worker must connect to storage using the hostname `gallery-storage` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`gallery-net`**.
2. Start **`gallery-storage`** from image **`ubuntu:22.04`** on network `gallery-net` (detached + TTY: `-dit`).
3. Start **`gallery-worker`** from image **`ubuntu:22.04`** on network `gallery-net` (detached + TTY: `-dit`).
4. Inside `gallery-worker`, verify hostname **`gallery-storage`** resolves (use `getent hosts gallery-storage` or `ping gallery-storage` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `gallery-net` |
| Storage container name | `gallery-storage` |
| Storage image | `ubuntu:22.04` |
| Worker container name | `gallery-worker` |
| Worker image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect gallery-net
docker exec gallery-worker getent hosts gallery-storage
```

### Answer

```bash
docker network create gallery-net

docker run -dit \
  --name gallery-storage \
  --network gallery-net \
  ubuntu:22.04

docker run -dit \
  --name gallery-worker \
  --network gallery-net \
  ubuntu:22.04

docker exec gallery-worker getent hosts gallery-storage
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The gallery app reads settings from environment variables instead of hardcoded values.

### What you must do

1. Run container **`gallery-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=production`
   - `STORAGE_HOST=gallery-storage`
   - `MAX_UPLOAD_MB=50`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `gallery-env` |
| `APP_ENV` | `production` |
| `STORAGE_HOST` | `gallery-storage` |
| `MAX_UPLOAD_MB` | `50` |

### How to verify

```bash
docker exec gallery-env printenv APP_ENV STORAGE_HOST MAX_UPLOAD_MB
```

### Answer

```bash
docker run -dit \
  --name gallery-env \
  -e APP_ENV=production \
  -e STORAGE_HOST=gallery-storage \
  -e MAX_UPLOAD_MB=50 \
  ubuntu:22.04

docker exec gallery-env printenv APP_ENV STORAGE_HOST MAX_UPLOAD_MB
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + postgres + redis) in one YAML file.

### Scenario

Deploy the gallery staging stack: nginx frontend, PostgreSQL database, and Redis cache.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`db`**, **`cache`**.
3. Declare a named volume for PostgreSQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9383:80` | on network `gallery-compose-net` |
| `db` | `postgres:15-alpine` | (none on host) | password `gallery123`, volume `gallery-pg:/var/lib/postgresql/data` |
| `cache` | `redis:7.2-alpine` | (none on host) | on network `gallery-compose-net` |

| Resource | Name |
|----------|------|
| Volume | `gallery-pg` |
| Network | `gallery-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9383
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9383:80"
    networks:
      - gallery-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: gallery123
    volumes:
      - gallery-pg:/var/lib/postgresql/data
    networks:
      - gallery-compose-net

  cache:
    image: redis:7.2-alpine
    networks:
      - gallery-compose-net

volumes:
  gallery-pg:

networks:
  gallery-compose-net:
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

Container `gallery-uploader` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name gallery-uploader ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs gallery-uploader`, and `docker inspect gallery-uploader` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`gallery-uploader-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `gallery-uploader` |
| Fixed container name | `gallery-uploader-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=gallery-uploader-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name gallery-uploader ubuntu:22.04
docker ps -a --filter name=gallery-uploader
docker logs gallery-uploader

docker rm -f gallery-uploader
docker run -dit --name gallery-uploader-fixed ubuntu:22.04
docker ps --filter name=gallery-uploader-fixed
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
2. Create Linux user **`galleryuser`** inside the image.
3. Add `USER galleryuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`gallery-secure:v1`**, run container **`gallery-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `galleryuser` |
| Image tag | `gallery-secure:v1` |
| Container name | `gallery-secure` |

### How to verify

```bash
docker exec gallery-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m galleryuser
USER galleryuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t gallery-secure:v1 .
docker run -d --name gallery-secure gallery-secure:v1
docker exec gallery-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready gallery edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `galleryuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env vars + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9384:8080` |
| Environment | `APP_ENV=production`, `CDN_REGION=us-east` |
| Named volume | `gallery-cache` mounted at `/cache` |
| Network | `gallery-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `galleryuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9384
docker volume ls | grep gallery-cache
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D galleryuser
USER galleryuser
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
      - "9384:8080"
    environment:
      APP_ENV: production
      CDN_REGION: us-east
    volumes:
      - gallery-cache:/cache
    networks:
      - gallery-prod-net

volumes:
  gallery-cache:

networks:
  gallery-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9384
```

---
