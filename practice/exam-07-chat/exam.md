# Docker Practice Exam 7 — Chat Messaging App

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-07-chat/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-07-chat`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built nginx container in the background with a restart policy.

### Scenario

The chat team needs a quick gateway page while the real app is being built.

### What you must do

1. Pull the image if you do not have it locally.
2. Run nginx as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `chat-gateway` |
| Port mapping (host:container) | `9680:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=chat-gateway
curl http://localhost:9680
```

### Answer

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name chat-gateway \
  -p 9680:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=chat-gateway
curl http://localhost:9680
```

---

## Task 2 — Image Creation (login page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

The designer delivered a login HTML file. Package it into an image so anyone can run the same page without copying files manually.

### Provided files

| File | Description |
|------|-------------|
| `login.html` | Chat login page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `login.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`chat-login:v1`**.
5. Run a container named **`chat-login`** from that image on port **`9681:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `chat-login:v1` |
| Container name | `chat-login` |
| Port mapping | `9681:80` |

### How to verify

```bash
docker images chat-login
curl http://localhost:9681
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY login.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t chat-login:v1 .
docker run -d --name chat-login -p 9681:80 chat-login:v1
curl http://localhost:9681
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Chat message logs must not be lost when the archive container is replaced.

### What you must do

1. Create a named volume called **`chat-messages`**.
2. Start container **`chat-archive1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`chat-messages`** at **`/messages`** inside the container.
4. Inside the container, create file **`/messages/room-1.log`** with content: `user1: hello`
5. Exit, then **remove** container `chat-archive1` completely.
6. Start a **new** container **`chat-archive2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `chat-archive2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `chat-messages` |
| Mount path (inside container) | `/messages` |
| First container name | `chat-archive1` |
| Second container name | `chat-archive2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect chat-messages
docker exec chat-archive2 cat /messages/room-1.log
```

### Answer

```bash
docker volume create chat-messages

docker run -it --name chat-archive1 \
  -v chat-messages:/messages \
  ubuntu:22.04
# inside container:
echo "user1: hello" > /messages/room-1.log
exit

docker rm -f chat-archive1

docker run -it --name chat-archive2 \
  -v chat-messages:/messages \
  ubuntu:22.04
# inside container:
cat /messages/room-1.log
exit
```

---

## Task 4 — Host Bind Mount (FE assets)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Frontend developers edit chat UI files on their laptop. Nginx should serve those files directly from disk during development.

### Provided files

| File | Description |
|------|-------------|
| `chat-assets-index.html` | Chat UI page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-07-chat/`), copy `chat-assets-index.html` to a new file named **`index.html`**:
   ```bash
   cp chat-assets-index.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new line of HTML).
6. Run `curl http://localhost:9682` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `chat-assets` |
| Port mapping (host:container) | `9682:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-07-chat` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name chat-assets
-p 9682:80
-v <HOST_PATH_TO_exam-07-chat>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9682
docker ps --filter name=chat-assets
# edit index.html on host, then:
curl http://localhost:9682
```

### Answer

```bash
cp chat-assets-index.html index.html

docker run -d \
  --name chat-assets \
  -p 9682:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-07-chat:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9682
# edit index.html on host, then:
curl http://localhost:9682
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The chat API must connect to Redis using the hostname `chat-redis` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`chat-net`**.
2. Start **`chat-redis`** from image **`redis:7.2-alpine`** on network `chat-net` (detached).
3. Start **`chat-api`** from image **`ubuntu:22.04`** on network `chat-net` (detached + TTY: `-dit`).
4. Inside `chat-api`, verify hostname **`chat-redis`** resolves (use `getent hosts chat-redis` or `ping chat-redis` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `chat-net` |
| Redis container name | `chat-redis` |
| Redis image | `redis:7.2-alpine` |
| API container name | `chat-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect chat-net
docker exec chat-api getent hosts chat-redis
```

### Answer

```bash
docker network create chat-net

docker run -d \
  --name chat-redis \
  --network chat-net \
  redis:7.2-alpine

docker run -dit \
  --name chat-api \
  --network chat-net \
  ubuntu:22.04

docker exec chat-api getent hosts chat-redis
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The chat server reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`chat-server-env`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=production`
   - `REDIS_URL=redis://chat-redis:6379`
   - `MAX_MESSAGE_LEN=4096`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `chat-server-env` |
| `APP_ENV` | `production` |
| `REDIS_URL` | `redis://chat-redis:6379` |
| `MAX_MESSAGE_LEN` | `4096` |

### How to verify

```bash
docker exec chat-server-env printenv APP_ENV REDIS_URL MAX_MESSAGE_LEN
```

### Answer

```bash
docker run -dit \
  --name chat-server-env \
  -e APP_ENV=production \
  -e REDIS_URL=redis://chat-redis:6379 \
  -e MAX_MESSAGE_LEN=4096 \
  ubuntu:22.04

docker exec chat-server-env printenv APP_ENV REDIS_URL MAX_MESSAGE_LEN
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + redis + mongo) in one YAML file.

### Scenario

Deploy the chat staging stack: nginx frontend, Redis cache, and MongoDB database.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`redis`**, **`mongo`**.
3. Declare a named volume for MongoDB data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9683:80` | on network `chat-compose-net` |
| `redis` | `redis:7.2-alpine` | (none on host) | on network `chat-compose-net` |
| `mongo` | `mongo:7.0` | (none on host) | user `chatadmin`, password `chatpass`, volume `chat-mongo:/data/db` |

| Resource | Name |
|----------|------|
| Volume | `chat-mongo` |
| Network | `chat-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9683
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9683:80"
    networks:
      - chat-compose-net

  redis:
    image: redis:7.2-alpine
    networks:
      - chat-compose-net

  mongo:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: chatadmin
      MONGO_INITDB_ROOT_PASSWORD: chatpass
    volumes:
      - chat-mongo:/data/db
    networks:
      - chat-compose-net

volumes:
  chat-mongo:

networks:
  chat-compose-net:
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

Container `chat-bot` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name chat-bot ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs chat-bot`, and `docker inspect chat-bot` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`chat-bot-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `chat-bot` |
| Fixed container name | `chat-bot-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=chat-bot-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name chat-bot ubuntu:22.04
docker ps -a --filter name=chat-bot
docker logs chat-bot

docker rm -f chat-bot
docker run -dit --name chat-bot-fixed ubuntu:22.04
docker ps --filter name=chat-bot-fixed
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
2. Create Linux user **`chatuser`** inside the image.
3. Add `USER chatuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`chat-secure:v1`**, run container **`chat-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `chatuser` |
| Image tag | `chat-secure:v1` |
| Container name | `chat-secure` |

### How to verify

```bash
docker exec chat-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m chatuser
USER chatuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t chat-secure:v1 .
docker run -d --name chat-secure chat-secure:v1
docker exec chat-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready chat edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `chatuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env `APP_ENV=production`, volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9684:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `chat-prod-data` mounted at `/data` |
| Network | `chat-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `chatuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9684
docker volume ls | grep chat-prod
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D chatuser
USER chatuser
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
      - "9684:8080"
    environment:
      APP_ENV: production
    volumes:
      - chat-prod-data:/data
    networks:
      - chat-prod-net

volumes:
  chat-prod-data:

networks:
  chat-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9684
```
