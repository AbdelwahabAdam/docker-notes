# Docker Practice Exam 6 — Weather Dashboard

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-06-weather/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-06-weather`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built Redis container in the background with a restart policy.

### Scenario

The weather service needs a cache layer for forecast data.

### What you must do

1. Pull the image if you do not have it locally.
2. Run Redis as a **detached** container (`-d`).
3. Confirm the container stays **Up** and responds to `PING`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `redis:7.2-alpine` |
| Container name | `weather-cache` |
| Port mapping (host:container) | `9580:6379` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=weather-cache
docker exec weather-cache redis-cli ping
```

### Answer

```bash
docker pull redis:7.2-alpine
docker run -d \
  --name weather-cache \
  -p 9580:6379 \
  --restart unless-stopped \
  redis:7.2-alpine

docker ps --filter name=weather-cache
docker exec weather-cache redis-cli ping
```

---

## Task 2 — Image Creation (widget page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The team needs a weather widget page packaged as an image for consistent deployment.

### Provided files

| File | Description |
|------|-------------|
| `widget.html` | Weather widget page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `widget.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`weather-widget:v1`**.
5. Run a container named **`weather-widget`** from that image on port **`9581:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `weather-widget:v1` |
| Container name | `weather-widget` |
| Port mapping | `9581:80` |

### How to verify

```bash
docker images weather-widget
curl http://localhost:9581
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY widget.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t weather-widget:v1 .
docker run -d --name weather-widget -p 9581:80 weather-widget:v1
curl http://localhost:9581
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Historical weather readings must not be lost when the storage container is replaced.

### What you must do

1. Create a named volume called **`weather-history`**.
2. Start container **`weather-hist1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`weather-history`** at **`/readings`** inside the container.
4. Inside the container, create file **`/readings/2024-01-01.txt`** with content: `sunny,22C,humidity=45`
5. Exit, then **remove** container `weather-hist1` completely.
6. Start a **new** container **`weather-hist2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `weather-hist2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `weather-history` |
| Mount path (inside container) | `/readings` |
| First container name | `weather-hist1` |
| Second container name | `weather-hist2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect weather-history
docker exec weather-hist2 cat /readings/2024-01-01.txt
```

### Answer

```bash
docker volume create weather-history

docker run -it --name weather-hist1 \
  -v weather-history:/readings \
  ubuntu:22.04
# inside container:
echo "sunny,22C,humidity=45" > /readings/2024-01-01.txt
exit

docker rm -f weather-hist1

docker run -it --name weather-hist2 \
  -v weather-history:/readings \
  ubuntu:22.04
# inside container:
cat /readings/2024-01-01.txt
exit
```

---

## Task 4 — Host Bind Mount (forecast templates)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Meteorologists edit forecast templates on their laptop. Nginx should serve those files directly from disk.

### Provided files

| File | Description |
|------|-------------|
| `forecast-index.html` | Forecast page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-06-weather/`), copy `forecast-index.html` to a new file named **`index.html`**:
   ```bash
   cp forecast-index.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (update the forecast text).
6. Run `curl http://localhost:9582` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `weather-live` |
| Port mapping (host:container) | `9582:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-06-weather` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name weather-live
-p 9582:80
-v <HOST_PATH_TO_exam-06-weather>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9582
docker ps --filter name=weather-live
# edit index.html on host, then:
curl http://localhost:9582
```

### Answer

```bash
cp forecast-index.html index.html

docker run -d \
  --name weather-live \
  -p 9582:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-06-weather:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9582
# edit index.html on host, then:
curl http://localhost:9582
```

---

## Task 5 — Networking (container DNS)

### Goal

Multiple containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The weather aggregator must connect to Redis and a data store using hostnames — not hardcoded IP addresses.

### What you must do

1. Create a Docker network named **`weather-net`**.
2. Start **`weather-redis`** from image **`redis:7.2-alpine`** on network `weather-net` (detached).
3. Start **`weather-db`** from image **`ubuntu:22.04`** on network `weather-net` (detached + TTY: `-dit`).
4. Start **`weather-aggregator`** from image **`ubuntu:22.04`** on network `weather-net` (detached + TTY: `-dit`).
5. Inside `weather-aggregator`, verify hostnames **`weather-redis`** and **`weather-db`** resolve.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `weather-net` |
| Redis container name | `weather-redis` |
| Redis image | `redis:7.2-alpine` |
| DB container name | `weather-db` |
| DB image | `ubuntu:22.04` |
| Aggregator container name | `weather-aggregator` |
| Aggregator image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect weather-net
docker exec weather-aggregator getent hosts weather-redis
docker exec weather-aggregator getent hosts weather-db
```

### Answer

```bash
docker network create weather-net

docker run -d \
  --name weather-redis \
  --network weather-net \
  redis:7.2-alpine

docker run -dit \
  --name weather-db \
  --network weather-net \
  ubuntu:22.04

docker run -dit \
  --name weather-aggregator \
  --network weather-net \
  ubuntu:22.04

docker exec weather-aggregator getent hosts weather-redis
docker exec weather-aggregator getent hosts weather-db
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The weather fetcher reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`weather-fetcher`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=staging`
   - `API_KEY=demo-key-123`
   - `CACHE_HOST=weather-redis`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `weather-fetcher` |
| `APP_ENV` | `staging` |
| `API_KEY` | `demo-key-123` |
| `CACHE_HOST` | `weather-redis` |

### How to verify

```bash
docker exec weather-fetcher printenv APP_ENV API_KEY CACHE_HOST
```

### Answer

```bash
docker run -dit \
  --name weather-fetcher \
  -e APP_ENV=staging \
  -e API_KEY=demo-key-123 \
  -e CACHE_HOST=weather-redis \
  ubuntu:22.04

docker exec weather-fetcher printenv APP_ENV API_KEY CACHE_HOST
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + redis + postgres) in one YAML file.

### Scenario

Deploy the weather staging stack: nginx frontend, Redis cache, and PostgreSQL database.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`cache`**, **`db`**.
3. Declare a named volume for PostgreSQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9583:80` | on network `weather-stack-net` |
| `cache` | `redis:7.2-alpine` | (none on host) | on network `weather-stack-net` |
| `db` | `postgres:15-alpine` | (none on host) | password `weather123`, volume `weather-pg:/var/lib/postgresql/data` |

| Resource | Name |
|----------|------|
| Volume | `weather-pg` |
| Network | `weather-stack-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9583
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9583:80"
    networks:
      - weather-stack-net

  cache:
    image: redis:7.2-alpine
    networks:
      - weather-stack-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: weather123
    volumes:
      - weather-pg:/var/lib/postgresql/data
    networks:
      - weather-stack-net

volumes:
  weather-pg:

networks:
  weather-stack-net:
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

Container `weather-collector` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name weather-collector ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs weather-collector`, and `docker inspect weather-collector` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`weather-collector-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `weather-collector` |
| Fixed container name | `weather-collector-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=weather-collector-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name weather-collector ubuntu:22.04
docker ps -a --filter name=weather-collector
docker logs weather-collector

docker rm -f weather-collector
docker run -dit --name weather-collector-fixed ubuntu:22.04
docker ps --filter name=weather-collector-fixed
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
2. Create Linux user **`weatherapp`** inside the image.
3. Add `USER weatherapp` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`weather-secure:v1`**, run container **`weather-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `weatherapp` |
| Image tag | `weather-secure:v1` |
| Container name | `weather-secure` |

### How to verify

```bash
docker exec weather-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m weatherapp
USER weatherapp
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t weather-secure:v1 .
docker run -d --name weather-secure weather-secure:v1
docker exec weather-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready weather edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `weatherapp`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9584:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `weather-data` mounted at `/data` |
| Network | `weather-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `weatherapp` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9584
docker volume ls | grep weather-data
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D weatherapp
USER weatherapp
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
      - "9584:8080"
    environment:
      APP_ENV: production
    volumes:
      - weather-data:/data
    networks:
      - weather-prod-net

volumes:
  weather-data:

networks:
  weather-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9584
```

---
