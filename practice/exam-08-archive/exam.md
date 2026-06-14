# Docker Practice Exam 8 — Document Archive

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-08-archive/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-08-archive`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The archive team needs a quick web gateway while the full document portal is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `archive-web` |
| Port mapping (host:container) | `9780:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=archive-web
curl http://localhost:9780
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name archive-web \
  -p 9780:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=archive-web
curl http://localhost:9780
```

---

## Task 2 — Image Creation (portal page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered an archive portal page. Package it into an image for consistent deployment.

### Provided files

| File | Description |
|------|-------------|
| `portal.html` | Archive portal page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `portal.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`archive-portal:v1`**.
5. Run a container named **`archive-portal`** from that image on port **`9781:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `archive-portal:v1` |
| Container name | `archive-portal` |
| Port mapping | `9781:80` |

### How to verify

```bash
docker images archive-portal
curl http://localhost:9781
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY portal.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t archive-portal:v1 .
docker run -d --name archive-portal -p 9781:80 archive-portal:v1
curl http://localhost:9781
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Document index metadata must not be lost when the indexer container is replaced.

### Provided files

| File | Description |
|------|-------------|
| `doc-001.idx` | Sample index entry — use as reference for file content |

### What you must do

1. Create a named volume called **`archive-index`**.
2. Start container **`archive-idx1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`archive-index`** at **`/index`** inside the container.
4. Inside the container, create file **`/index/doc-001.idx`** with content from the provided file (or equivalent metadata).
5. Exit, then **remove** container `archive-idx1` completely.
6. Start a **new** container **`archive-idx2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `archive-idx2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `archive-index` |
| Mount path (inside container) | `/index` |
| First container name | `archive-idx1` |
| Second container name | `archive-idx2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect archive-index
docker exec archive-idx2 cat /index/doc-001.idx
```

### Answer

```bash
docker volume create archive-index

docker run -it --name archive-idx1 \
  -v archive-index:/index \
  ubuntu:22.04
# inside container (use provided doc-001.idx content or equivalent):
echo "doc metadata" > /index/doc-001.idx
exit

docker rm -f archive-idx1

docker run -it --name archive-idx2 \
  -v archive-index:/index \
  ubuntu:22.04
# inside container:
cat /index/doc-001.idx
exit
```

---

## Task 4 — Host Bind Mount (inbox page)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Staff edit the document inbox page on their laptop. Nginx should serve those files directly from disk.

### Provided files

| File | Description |
|------|-------------|
| `inbox-index.html` | Inbox page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-08-archive/`), copy `inbox-index.html` to a new file named **`index.html`**:
   ```bash
   cp inbox-index.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new document entry).
6. Run `curl http://localhost:9782` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `archive-inbox` |
| Port mapping (host:container) | `9782:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-08-archive` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name archive-inbox
-p 9782:80
-v <HOST_PATH_TO_exam-08-archive>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9782
docker ps --filter name=archive-inbox
# edit index.html on host, then:
curl http://localhost:9782
```

### Answer

```bash
cp inbox-index.html index.html

docker run -d \
  --name archive-inbox \
  -p 9782:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-08-archive:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9782
# edit index.html on host, then:
curl http://localhost:9782
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The archive indexer must connect to the search service using the hostname `archive-search` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`archive-net`**.
2. Start **`archive-search`** from image **`ubuntu:22.04`** on network `archive-net` (detached + TTY: `-dit`).
3. Start **`archive-indexer`** from image **`ubuntu:22.04`** on network `archive-net` (detached + TTY: `-dit`).
4. Inside `archive-indexer`, verify hostname **`archive-search`** resolves (use `getent hosts archive-search` or `ping archive-search` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `archive-net` |
| Search container name | `archive-search` |
| Search image | `ubuntu:22.04` |
| Indexer container name | `archive-indexer` |
| Indexer image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect archive-net
docker exec archive-indexer getent hosts archive-search
```

### Answer

```bash
docker network create archive-net

docker run -dit \
  --name archive-search \
  --network archive-net \
  ubuntu:22.04

docker run -dit \
  --name archive-indexer \
  --network archive-net \
  ubuntu:22.04

docker exec archive-indexer getent hosts archive-search
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The archive processor reads settings from environment variables instead of hardcoded values.

### What you must do

1. Run container **`archive-proc`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=production`
   - `SEARCH_HOST=archive-search`
   - `RETENTION_DAYS=365`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `archive-proc` |
| `APP_ENV` | `production` |
| `SEARCH_HOST` | `archive-search` |
| `RETENTION_DAYS` | `365` |

### How to verify

```bash
docker exec archive-proc printenv APP_ENV SEARCH_HOST RETENTION_DAYS
```

### Answer

```bash
docker run -dit \
  --name archive-proc \
  -e APP_ENV=production \
  -e SEARCH_HOST=archive-search \
  -e RETENTION_DAYS=365 \
  ubuntu:22.04

docker exec archive-proc printenv APP_ENV SEARCH_HOST RETENTION_DAYS
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + postgres + redis) in one YAML file.

### Scenario

Deploy the archive staging stack: nginx frontend, PostgreSQL database, and Redis cache.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`db`**, **`cache`**.
3. Declare a named volume for PostgreSQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9783:80` | on network `archive-compose-net` |
| `db` | `postgres:15-alpine` | (none on host) | password `archive123`, volume `archive-pg:/var/lib/postgresql/data` |
| `cache` | `redis:7.2-alpine` | (none on host) | on network `archive-compose-net` |

| Resource | Name |
|----------|------|
| Volume | `archive-pg` |
| Network | `archive-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9783
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9783:80"
    networks:
      - archive-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: archive123
    volumes:
      - archive-pg:/var/lib/postgresql/data
    networks:
      - archive-compose-net

  cache:
    image: redis:7.2-alpine
    networks:
      - archive-compose-net

volumes:
  archive-pg:

networks:
  archive-compose-net:
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

Container `archive-scanner` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name archive-scanner ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs archive-scanner`, and `docker inspect archive-scanner` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`archive-scanner-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `archive-scanner` |
| Fixed container name | `archive-scanner-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=archive-scanner-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name archive-scanner ubuntu:22.04
docker ps -a --filter name=archive-scanner
docker logs archive-scanner

docker rm -f archive-scanner
docker run -dit --name archive-scanner-fixed ubuntu:22.04
docker ps --filter name=archive-scanner-fixed
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
2. Create Linux user **`archiveuser`** inside the image.
3. Add `USER archiveuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`archive-secure:v1`**, run container **`archive-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `archiveuser` |
| Image tag | `archive-secure:v1` |
| Container name | `archive-secure` |

### How to verify

```bash
docker exec archive-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m archiveuser
USER archiveuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t archive-secure:v1 .
docker run -d --name archive-secure archive-secure:v1
docker exec archive-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready archive edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `archiveuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9784:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `archive-data` mounted at `/archive` |
| Network | `archive-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `archiveuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9784
docker volume ls | grep archive-data
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D archiveuser
USER archiveuser
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
      - "9784:8080"
    environment:
      APP_ENV: production
    volumes:
      - archive-data:/archive
    networks:
      - archive-prod-net

volumes:
  archive-data:

networks:
  archive-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9784
```

---
