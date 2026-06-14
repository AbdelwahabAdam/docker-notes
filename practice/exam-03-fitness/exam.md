# Docker Practice Exam 3 — Fitness Tracker API

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-03-fitness/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-03-fitness`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built Redis container in the background with a restart policy.

### Scenario

The fitness API needs a cache layer before the full backend is deployed.

### What you must do

1. Pull the image if you do not have it locally.
2. Run Redis as a **detached** container (`-d`).
3. Confirm the container stays **Up** and responds to `PING`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `redis:7.2-alpine` |
| Container name | `fitness-redis` |
| Port mapping (host:container) | `9280:6379` |
| Restart policy | `always` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=fitness-redis
docker exec fitness-redis redis-cli ping
```

### Answer

```bash
docker pull redis:7.2-alpine
docker run -d \
  --name fitness-redis \
  -p 9280:6379 \
  --restart always \
  redis:7.2-alpine

docker ps --filter name=fitness-redis
docker exec fitness-redis redis-cli ping
```

---

## Task 2 — Image Creation (health page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The team needs a health-status page packaged as an image for monitoring dashboards.

### Provided files

| File | Description |
|------|-------------|
| `health.html` | Fitness health page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `health.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`fitness-health:v1`**.
5. Run a container named **`fitness-health`** from that image on port **`9281:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `fitness-health:v1` |
| Container name | `fitness-health` |
| Port mapping | `9281:80` |

### How to verify

```bash
docker images fitness-health
curl http://localhost:9281
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY health.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t fitness-health:v1 .
docker run -d --name fitness-health -p 9281:80 fitness-health:v1
curl http://localhost:9281
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Workout logs must not be lost when the logging container is replaced.

### What you must do

1. Create a named volume called **`fitness-logs`**.
2. Start container **`fitness-log1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`fitness-logs`** at **`/logs`** inside the container.
4. Inside the container, create file **`/logs/workout-day1.txt`** with content: `5km run;duration=28min`
5. Exit, then **remove** container `fitness-log1` completely.
6. Start a **new** container **`fitness-log2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `fitness-log2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `fitness-logs` |
| Mount path (inside container) | `/logs` |
| First container name | `fitness-log1` |
| Second container name | `fitness-log2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect fitness-logs
docker exec fitness-log2 cat /logs/workout-day1.txt
```

### Answer

```bash
docker volume create fitness-logs

docker run -it --name fitness-log1 \
  -v fitness-logs:/logs \
  ubuntu:22.04
# inside container:
echo "5km run;duration=28min" > /logs/workout-day1.txt
exit

docker rm -f fitness-log1

docker run -it --name fitness-log2 \
  -v fitness-logs:/logs \
  ubuntu:22.04
# inside container:
cat /logs/workout-day1.txt
exit
```

---

## Task 4 — Host Bind Mount (live health page)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Developers edit the fitness health page on their laptop. Nginx should serve those files directly from disk during development.

### Provided files

| File | Description |
|------|-------------|
| `health.html` | Health status page — you must copy it to `index.html` (nginx default page) |
| `settings.json` | App config file — also in this folder and served when the whole folder is mounted |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-03-fitness/`), copy `health.html` to a new file named **`index.html`**:
   ```bash
   cp health.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new status line).
6. Run `curl http://localhost:9282` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `fitness-live` |
| Port mapping (host:container) | `9282:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-03-fitness` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name fitness-live
-p 9282:80
-v <HOST_PATH_TO_exam-03-fitness>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9282
docker ps --filter name=fitness-live
# edit index.html on host, then:
curl http://localhost:9282
```

### Answer

```bash
cp health.html index.html

docker run -d \
  --name fitness-live \
  -p 9282:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-03-fitness:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9282
# edit index.html on host, then:
curl http://localhost:9282
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The fitness API must connect to Redis using the hostname `fitness-cache` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`fitness-net`**.
2. Start **`fitness-cache`** from image **`redis:7.2-alpine`** on network `fitness-net` (detached).
3. Start **`fitness-api`** from image **`ubuntu:22.04`** on network `fitness-net` (detached + TTY: `-dit`).
4. Inside `fitness-api`, verify hostname **`fitness-cache`** resolves (use `getent hosts fitness-cache` or `ping fitness-cache` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `fitness-net` |
| Cache container name | `fitness-cache` |
| Cache image | `redis:7.2-alpine` |
| API container name | `fitness-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect fitness-net
docker exec fitness-api getent hosts fitness-cache
```

### Answer

```bash
docker network create fitness-net

docker run -d \
  --name fitness-cache \
  --network fitness-net \
  redis:7.2-alpine

docker run -dit \
  --name fitness-api \
  --network fitness-net \
  ubuntu:22.04

docker exec fitness-api getent hosts fitness-cache
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The fitness server reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`fitness-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=development`
   - `REDIS_HOST=fitness-cache`
   - `LOG_LEVEL=debug`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `fitness-env` |
| `APP_ENV` | `development` |
| `REDIS_HOST` | `fitness-cache` |
| `LOG_LEVEL` | `debug` |

### How to verify

```bash
docker exec fitness-env printenv APP_ENV REDIS_HOST LOG_LEVEL
```

### Answer

```bash
docker run -dit \
  --name fitness-env \
  -e APP_ENV=development \
  -e REDIS_HOST=fitness-cache \
  -e LOG_LEVEL=debug \
  ubuntu:22.04

docker exec fitness-env printenv APP_ENV REDIS_HOST LOG_LEVEL
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + redis + mongo) in one YAML file.

### Scenario

Deploy the fitness staging stack: nginx frontend, Redis cache, and MongoDB database.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`redis`**, **`mongo`**.
3. Declare a named volume for MongoDB data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9283:80` | on network `fitness-stack-net` |
| `redis` | `redis:7.2-alpine` | (none on host) | on network `fitness-stack-net` |
| `mongo` | `mongo:7.0` | (none on host) | user `root`, password `fitness123`, volume `fitness-mongo:/data/db` |

| Resource | Name |
|----------|------|
| Volume | `fitness-mongo` |
| Network | `fitness-stack-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9283
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9283:80"
    networks:
      - fitness-stack-net

  redis:
    image: redis:7.2-alpine
    networks:
      - fitness-stack-net

  mongo:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: fitness123
    volumes:
      - fitness-mongo:/data/db
    networks:
      - fitness-stack-net

volumes:
  fitness-mongo:

networks:
  fitness-stack-net:
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

Container `fitness-worker` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name fitness-worker ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs fitness-worker`, and `docker inspect fitness-worker` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`fitness-worker-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `fitness-worker` |
| Fixed container name | `fitness-worker-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=fitness-worker-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name fitness-worker ubuntu:22.04
docker ps -a --filter name=fitness-worker
docker logs fitness-worker

docker rm -f fitness-worker
docker run -dit --name fitness-worker-fixed ubuntu:22.04
docker ps --filter name=fitness-worker-fixed
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
2. Create Linux user **`fitnessapp`** inside the image.
3. Add `USER fitnessapp` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`fitness-secure:v1`**, run container **`fitness-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `fitnessapp` |
| Image tag | `fitness-secure:v1` |
| Container name | `fitness-secure` |

### How to verify

```bash
docker exec fitness-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m fitnessapp
USER fitnessapp
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t fitness-secure:v1 .
docker run -d --name fitness-secure fitness-secure:v1
docker exec fitness-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready fitness edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `fitnessapp`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env vars + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9284:8080` |
| Environment | `APP_ENV=production`, `METRICS_ENABLED=true` |
| Named volume | `fitness-metrics-data` mounted at `/data` |
| Network | `fitness-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `fitnessapp` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9284
docker volume ls | grep fitness-metrics
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D fitnessapp
USER fitnessapp
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
      - "9284:8080"
    environment:
      APP_ENV: production
      METRICS_ENABLED: "true"
    volumes:
      - fitness-metrics-data:/data
    networks:
      - fitness-prod-net

volumes:
  fitness-metrics-data:

networks:
  fitness-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9284
```

---
