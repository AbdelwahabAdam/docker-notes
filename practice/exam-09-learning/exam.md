# Docker Practice Exam 9 — Online Learning Platform

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-09-learning/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-09-learning`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The learning platform team needs a quick web gateway while the full LMS is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `learn-web` |
| Port mapping (host:container) | `9880:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=learn-web
curl http://localhost:9880
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name learn-web \
  -p 9880:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=learn-web
curl http://localhost:9880
```

---

## Task 2 — Image Creation (home page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered a course home page. Package it into an image for consistent deployment.

### Provided files

| File | Description |
|------|-------------|
| `home.html` | Learning platform home page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `home.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`learn-home:v1`**.
5. Run a container named **`learn-home`** from that image on port **`9881:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `learn-home:v1` |
| Container name | `learn-home` |
| Port mapping | `9881:80` |

### How to verify

```bash
docker images learn-home
curl http://localhost:9881
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY home.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t learn-home:v1 .
docker run -d --name learn-home -p 9881:80 learn-home:v1
curl http://localhost:9881
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Student progress data must not be lost when the progress tracker container is replaced.

### What you must do

1. Create a named volume called **`learn-progress`**.
2. Start container **`learn-prog1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`learn-progress`** at **`/progress`** inside the container.
4. Inside the container, create file **`/progress/student-42.json`** with content: `{"lesson":1,"completed":true}`
5. Exit, then **remove** container `learn-prog1` completely.
6. Start a **new** container **`learn-prog2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `learn-prog2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `learn-progress` |
| Mount path (inside container) | `/progress` |
| First container name | `learn-prog1` |
| Second container name | `learn-prog2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect learn-progress
docker exec learn-prog2 cat /progress/student-42.json
```

### Answer

```bash
docker volume create learn-progress

docker run -it --name learn-prog1 \
  -v learn-progress:/progress \
  ubuntu:22.04
# inside container:
echo '{"lesson":1,"completed":true}' > /progress/student-42.json
exit

docker rm -f learn-prog1

docker run -it --name learn-prog2 \
  -v learn-progress:/progress \
  ubuntu:22.04
# inside container:
cat /progress/student-42.json
exit
```

---

## Task 4 — Host Bind Mount (course home page)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Course authors edit the home page and materials on their laptop. Nginx should serve those files directly from disk.

### Provided files

| File | Description |
|------|-------------|
| `home.html` | Course home page — you must copy it to `index.html` (nginx default page) |
| `lesson.md` | Sample lesson content — also in this folder when the whole folder is mounted |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-09-learning/`), copy `home.html` to a new file named **`index.html`**:
   ```bash
   cp home.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new course announcement).
6. Run `curl http://localhost:9882` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `learn-live` |
| Port mapping (host:container) | `9882:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-09-learning` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name learn-live
-p 9882:80
-v <HOST_PATH_TO_exam-09-learning>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9882
docker ps --filter name=learn-live
# edit index.html on host, then:
curl http://localhost:9882
```

### Answer

```bash
cp home.html index.html

docker run -d \
  --name learn-live \
  -p 9882:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-09-learning:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9882
# edit index.html on host, then:
curl http://localhost:9882
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The learning API must connect to MongoDB using the hostname `learn-mongo` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`learn-net`**.
2. Start **`learn-mongo`** from image **`mongo:7.0`** on network `learn-net` with root credentials (detached).
3. Start **`learn-api`** from image **`ubuntu:22.04`** on network `learn-net` (detached + TTY: `-dit`).
4. Inside `learn-api`, verify hostname **`learn-mongo`** resolves (use `getent hosts learn-mongo`).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `learn-net` |
| Mongo container name | `learn-mongo` |
| Mongo image | `mongo:7.0` |
| Mongo root user | `root` |
| Mongo root password | `learn123` |
| API container name | `learn-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect learn-net
docker exec learn-api getent hosts learn-mongo
```

### Answer

```bash
docker network create learn-net

docker run -d \
  --name learn-mongo \
  --network learn-net \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=learn123 \
  mongo:7.0

docker run -dit \
  --name learn-api \
  --network learn-net \
  ubuntu:22.04

docker exec learn-api getent hosts learn-mongo
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using an env file and `-e` flags.

### Scenario

The learning app reads some settings from a file and overrides others at runtime.

### Provided files

| File | Description |
|------|-------------|
| `env.learn` | Env file — load with `--env-file env.learn` |

### What you must do

1. Run container **`learn-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Load variables from **`env.learn`** using **`--env-file env.learn`**.
3. Also set **`PORT=3000`** inline with `-e`.
4. Verify `APP_ENV`, `DB_HOST`, and `PORT` exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `learn-env` |
| Env file | `env.learn` |
| Extra variable | `PORT=3000` |

### How to verify

```bash
docker exec learn-env printenv APP_ENV DB_HOST PORT
```

### Answer

```bash
docker run -dit \
  --name learn-env \
  --env-file env.learn \
  -e PORT=3000 \
  ubuntu:22.04

docker exec learn-env printenv APP_ENV DB_HOST PORT
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + backend + mongo + redis) in one YAML file.

### Scenario

Deploy the learning staging stack: nginx frontend, backend placeholder, MongoDB, and Redis.

### Provided files

| File | Description |
|------|-------------|
| `api-server.js` | Backend API placeholder (reference for future containerization) |
| `api-package.json` | Node.js package metadata for the backend |

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define four services: **`web`**, **`backend`**, **`mongo`**, **`redis`**.
3. Declare a named volume for MongoDB data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9883:80` | `depends_on: [backend]`, on network `learn-stack-net` |
| `backend` | `node:20-alpine` | (none on host) | command `sleep infinity`, on network `learn-stack-net` |
| `mongo` | `mongo:7.0` | (none on host) | user `root`, password `learn123`, volume `learn-mongo:/data/db` |
| `redis` | `redis:7.2-alpine` | (none on host) | on network `learn-stack-net` |

| Resource | Name |
|----------|------|
| Volume | `learn-mongo` |
| Network | `learn-stack-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9883
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9883:80"
    depends_on:
      - backend
    networks:
      - learn-stack-net

  backend:
    image: node:20-alpine
    command: ["sleep", "infinity"]
    networks:
      - learn-stack-net

  mongo:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: learn123
    volumes:
      - learn-mongo:/data/db
    networks:
      - learn-stack-net

  redis:
    image: redis:7.2-alpine
    networks:
      - learn-stack-net

volumes:
  learn-mongo:

networks:
  learn-stack-net:
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

Container `learn-worker` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name learn-worker ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs learn-worker`, and `docker inspect learn-worker` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`learn-worker-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `learn-worker` |
| Fixed container name | `learn-worker-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=learn-worker-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name learn-worker ubuntu:22.04
docker ps -a --filter name=learn-worker
docker logs learn-worker

docker rm -f learn-worker
docker run -dit --name learn-worker-fixed ubuntu:22.04
docker ps --filter name=learn-worker-fixed
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
2. Create Linux user **`learnuser`** inside the image.
3. Add `USER learnuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`learn-secure:v1`**, run container **`learn-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `learnuser` |
| Image tag | `learn-secure:v1` |
| Container name | `learn-secure` |

### How to verify

```bash
docker exec learn-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m learnuser
USER learnuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t learn-secure:v1 .
docker run -d --name learn-secure learn-secure:v1
docker exec learn-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready learning platform edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `learnuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9884:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `learn-prod-data` mounted at `/data` |
| Network | `learn-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `learnuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9884
docker volume ls | grep learn-prod
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D learnuser
USER learnuser
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
      - "9884:8080"
    environment:
      APP_ENV: production
    volumes:
      - learn-prod-data:/data
    networks:
      - learn-prod-net

volumes:
  learn-prod-data:

networks:
  learn-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9884
```

---
