# Docker Practice Exam 10 — Healthcare Patient Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-10-healthcare/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-10-healthcare`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The healthcare team needs a quick patient portal gateway while the full application is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `health-portal-web` |
| Port mapping (host:container) | `9980:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=health-portal-web
curl http://localhost:9980
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name health-portal-web \
  -p 9980:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=health-portal-web
curl http://localhost:9980
```

---

## Task 2 — Image Creation (welcome page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered a patient welcome page. Package it into an image for consistent deployment.

### Provided files

| File | Description |
|------|-------------|
| `welcome.html` | Patient welcome page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `welcome.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`health-welcome:v1`**.
5. Run a container named **`health-welcome`** from that image on port **`9981:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `health-welcome:v1` |
| Container name | `health-welcome` |
| Port mapping | `9981:80` |

### How to verify

```bash
docker images health-welcome
curl http://localhost:9981
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t health-welcome:v1 .
docker run -d --name health-welcome -p 9981:80 health-welcome:v1
curl http://localhost:9981
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Audit logs must not be lost when the audit container is replaced.

### What you must do

1. Create a named volume called **`health-audit`**.
2. Start container **`health-audit1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`health-audit`** at **`/audit`** inside the container.
4. Inside the container, create file **`/audit/access.log`** with content: `2024-06-10 user=admin action=login`
5. Exit, then **remove** container `health-audit1` completely.
6. Start a **new** container **`health-audit2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `health-audit2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `health-audit` |
| Mount path (inside container) | `/audit` |
| First container name | `health-audit1` |
| Second container name | `health-audit2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect health-audit
docker exec health-audit2 cat /audit/access.log
```

### Answer

```bash
docker volume create health-audit

docker run -it --name health-audit1 \
  -v health-audit:/audit \
  ubuntu:22.04
# inside container:
echo "2024-06-10 user=admin action=login" > /audit/access.log
exit

docker rm -f health-audit1

docker run -it --name health-audit2 \
  -v health-audit:/audit \
  ubuntu:22.04
# inside container:
cat /audit/access.log
exit
```

---

## Task 4 — Host Bind Mount (compliance docs)

### Goal

Mount a **host folder** into a container so nginx serves compliance documents directly from disk — **no rebuild**.

### Scenario

Compliance officers publish policy documents on the host. Nginx should serve them read-only so the container cannot modify host files.

### Provided files

| File | Description |
|------|-------------|
| `policy.html` | Compliance policy page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-10-healthcare/`), copy `policy.html` to a new file named **`index.html`**:
   ```bash
   cp policy.html index.html
   ```

**Step B — Run nginx with read-only bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root **read-only** (`:ro`).
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a compliance note).
6. Run `curl http://localhost:9982` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `health-docs` |
| Port mapping (host:container) | `9982:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-10-healthcare` |
| Bind mount (container path) | `/usr/share/nginx/html:ro` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name health-docs
-p 9982:80
-v <HOST_PATH_TO_exam-10-healthcare>:/usr/share/nginx/html:ro
```

### How to verify

```bash
curl http://localhost:9982
docker ps --filter name=health-docs
# edit index.html on host, then:
curl http://localhost:9982
```

### Answer

```bash
cp policy.html index.html

docker run -d \
  --name health-docs \
  -p 9982:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-10-healthcare:/usr/share/nginx/html:ro \
  nginx:1.25-alpine

curl http://localhost:9982
# edit index.html on host, then:
curl http://localhost:9982
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The healthcare API must connect to PostgreSQL using the hostname `health-db` — not a hardcoded IP address.

### Provided files

| File | Description |
|------|-------------|
| `api-server.js` | Backend API reference (optional for future containerization) |

### What you must do

1. Create a Docker network named **`health-net`**.
2. Start **`health-db`** from image **`postgres:15-alpine`** on network `health-net` with `POSTGRES_PASSWORD=health123` (detached).
3. Start **`health-api`** from image **`ubuntu:22.04`** on network `health-net` (detached + TTY: `-dit`).
4. Inside `health-api`, verify hostname **`health-db`** resolves (use `getent hosts health-db` or `ping health-db` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `health-net` |
| DB container name | `health-db` |
| DB image | `postgres:15-alpine` |
| DB password | `health123` |
| API container name | `health-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect health-net
docker exec health-api getent hosts health-db
```

### Answer

```bash
docker network create health-net

docker run -d \
  --name health-db \
  --network health-net \
  -e POSTGRES_PASSWORD=health123 \
  postgres:15-alpine

docker run -dit \
  --name health-api \
  --network health-net \
  ubuntu:22.04

docker exec health-api getent hosts health-db
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using an env file and `-e` flags.

### Scenario

The healthcare app loads audit settings from a file and database connection details at runtime.

### Provided files

| File | Description |
|------|-------------|
| `health.env` | Env file — load with `--env-file health.env` |

### What you must do

1. Run container **`health-app-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Load variables from **`health.env`** using **`--env-file health.env`**.
3. Also set these inline with `-e`:
   - `APP_ENV=production`
   - `DB_HOST=health-db`
   - `DB_PORT=5432`
4. Verify all four variables (`APP_ENV`, `DB_HOST`, `DB_PORT`, `AUDIT_ENABLED`) exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `health-app-env` |
| Env file | `health.env` |
| `APP_ENV` | `production` |
| `DB_HOST` | `health-db` |
| `DB_PORT` | `5432` |

### How to verify

```bash
docker exec health-app-env printenv APP_ENV DB_HOST DB_PORT AUDIT_ENABLED
```

### Answer

```bash
docker run -dit \
  --name health-app-env \
  --env-file health.env \
  -e APP_ENV=production \
  -e DB_HOST=health-db \
  -e DB_PORT=5432 \
  ubuntu:22.04

docker exec health-app-env printenv APP_ENV DB_HOST DB_PORT AUDIT_ENABLED
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + postgres + redis) in one YAML file.

### Scenario

Deploy the healthcare staging stack: nginx frontend, PostgreSQL database, and Redis cache.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`db`**, **`cache`**.
3. Declare a named volume for PostgreSQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9983:80` | `depends_on: [db, cache]`, on network `health-compose-net` |
| `db` | `postgres:15-alpine` | (none on host) | password `health123`, volume `health-pg:/var/lib/postgresql/data` |
| `cache` | `redis:7.2-alpine` | (none on host) | `restart: always`, on network `health-compose-net` |

| Resource | Name |
|----------|------|
| Volume | `health-pg` |
| Network | `health-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9983
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9983:80"
    depends_on:
      - db
      - cache
    networks:
      - health-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: health123
    volumes:
      - health-pg:/var/lib/postgresql/data
    networks:
      - health-compose-net

  cache:
    image: redis:7.2-alpine
    restart: always
    networks:
      - health-compose-net

volumes:
  health-pg:

networks:
  health-compose-net:
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

Container `health-sync` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name health-sync ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs health-sync`, and `docker inspect health-sync` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`health-sync-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `health-sync` |
| Fixed container name | `health-sync-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=health-sync-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name health-sync ubuntu:22.04
docker ps -a --filter name=health-sync
docker logs health-sync

docker rm -f health-sync
docker run -dit --name health-sync-fixed ubuntu:22.04
docker ps --filter name=health-sync-fixed
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

Healthcare security policy forbids running application containers as root.

### What you must do

1. Create **`Dockerfile.secure`** using base image **`ubuntu:22.04`**.
2. Create Linux user **`healthuser`** inside the image.
3. Add `USER healthuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`health-secure:v1`**, run container **`health-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `healthuser` |
| Image tag | `health-secure:v1` |
| Container name | `health-secure` |

### How to verify

```bash
docker exec health-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m healthuser
USER healthuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t health-secure:v1 .
docker run -d --name health-secure health-secure:v1
docker exec health-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready healthcare portal edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `healthuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env vars + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9984:8080` |
| Environment | `APP_ENV=production`, `COMPLIANCE_MODE=strict` |
| Named volume | `health-prod-data` mounted at `/data` |
| Network | `health-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `healthuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9984
docker volume ls | grep health-prod
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D healthuser
USER healthuser
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
      - "9984:8080"
    environment:
      APP_ENV: production
      COMPLIANCE_MODE: strict
    volumes:
      - health-prod-data:/data
    networks:
      - health-prod-net

volumes:
  health-prod-data:

networks:
  health-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9984
```

---
