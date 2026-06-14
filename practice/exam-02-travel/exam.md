# Docker Practice Exam 2 — Travel Booking Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-02-travel/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-02-travel`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built Apache container in the background with a restart policy.

### Scenario

The travel team needs a quick marketing landing page for a campaign launch.

### What you must do

1. Pull the image if you do not have it locally.
2. Run Apache as a **detached** container (`-d`).
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `httpd:2.4-alpine` |
| Container name | `travel-web` |
| Port mapping (host:container) | `9180:80` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=travel-web
curl http://localhost:9180
```

### Answer

```bash
docker pull httpd:2.4-alpine
docker run -d \
  --name travel-web \
  -p 9180:80 \
  --restart unless-stopped \
  httpd:2.4-alpine

docker ps --filter name=travel-web
curl http://localhost:9180
```

---

## Task 2 — Image Creation (promo page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

Marketing delivered a promo HTML page. Package it into an image so the campaign page runs consistently everywhere.

### Provided files

| File | Description |
|------|-------------|
| `promo.html` | Travel promo page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`httpd:2.4-alpine`** as the base image.
3. Copy `promo.html` into the image as **`/usr/local/apache2/htdocs/index.html`**.
4. Build the image with tag **`travel-promo:v2`**.
5. Run a container named **`travel-promo`** from that image on port **`9181:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `httpd:2.4-alpine` |
| Image tag | `travel-promo:v2` |
| Container name | `travel-promo` |
| Port mapping | `9181:80` |

### How to verify

```bash
docker images travel-promo
curl http://localhost:9181
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM httpd:2.4-alpine
COPY promo.html /usr/local/apache2/htdocs/index.html
```

```bash
docker build -f Dockerfile.landing -t travel-promo:v2 .
docker run -d --name travel-promo -p 9181:80 travel-promo:v2
curl http://localhost:9181
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Travel booking records must not be lost when the records container is replaced.

### What you must do

1. Create a named volume called **`travel-bookings`**.
2. Start container **`travel-rec1`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`travel-bookings`** at **`/records`** inside the container.
4. Inside the container, create file **`/records/booking-001.txt`** with content: `flight=AA100;passenger=Smith`
5. Exit, then **remove** container `travel-rec1` completely.
6. Start a **new** container **`travel-rec2`** (same image, same volume, same mount path).
7. Prove the file still exists inside `travel-rec2`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `travel-bookings` |
| Mount path (inside container) | `/records` |
| First container name | `travel-rec1` |
| Second container name | `travel-rec2` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect travel-bookings
docker exec travel-rec2 cat /records/booking-001.txt
```

### Answer

```bash
docker volume create travel-bookings

docker run -it --name travel-rec1 \
  -v travel-bookings:/records \
  ubuntu:22.04
# inside container:
echo "flight=AA100;passenger=Smith" > /records/booking-001.txt
exit

docker rm -f travel-rec1

docker run -it --name travel-rec2 \
  -v travel-bookings:/records \
  ubuntu:22.04
# inside container:
cat /records/booking-001.txt
exit
```

---

## Task 4 — Host Bind Mount (marketing page)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Marketing edits campaign pages on their laptop. Nginx should serve those files directly from disk during development.

### Provided files

| File | Description |
|------|-------------|
| `marketing-index.html` | Marketing page — you must copy it to `index.html` (nginx default page) |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-02-travel/`), copy `marketing-index.html` to a new file named **`index.html`**:
   ```bash
   cp marketing-index.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new promo line).
6. Run `curl http://localhost:9182` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `travel-marketing` |
| Port mapping (host:container) | `9182:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-02-travel` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name travel-marketing
-p 9182:80
-v <HOST_PATH_TO_exam-02-travel>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9182
docker ps --filter name=travel-marketing
# edit index.html on host, then:
curl http://localhost:9182
```

### Answer

```bash
cp marketing-index.html index.html

docker run -d \
  --name travel-marketing \
  -p 9182:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-02-travel:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9182
# edit index.html on host, then:
curl http://localhost:9182
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The travel API must connect to the payment service using the hostname `travel-payment` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`travel-net`**.
2. Start **`travel-payment`** from image **`ubuntu:22.04`** on network `travel-net` (detached + TTY: `-dit`).
3. Start **`travel-api`** from image **`ubuntu:22.04`** on network `travel-net` (detached + TTY: `-dit`).
4. Inside `travel-api`, verify hostname **`travel-payment`** resolves (use `getent hosts travel-payment` or `ping travel-payment` after installing ping).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `travel-net` |
| Payment container name | `travel-payment` |
| Payment image | `ubuntu:22.04` |
| API container name | `travel-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect travel-net
docker exec travel-api getent hosts travel-payment
```

### Answer

```bash
docker network create travel-net

docker run -dit \
  --name travel-payment \
  --network travel-net \
  ubuntu:22.04

docker run -dit \
  --name travel-api \
  --network travel-net \
  ubuntu:22.04

docker exec travel-api getent hosts travel-payment
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The travel booking app reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`travel-envtest`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=production`
   - `PAYMENT_HOST=travel-payment`
   - `CURRENCY=USD`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `travel-envtest` |
| `APP_ENV` | `production` |
| `PAYMENT_HOST` | `travel-payment` |
| `CURRENCY` | `USD` |

### How to verify

```bash
docker exec travel-envtest printenv APP_ENV PAYMENT_HOST CURRENCY
```

### Answer

```bash
docker run -dit \
  --name travel-envtest \
  -e APP_ENV=production \
  -e PAYMENT_HOST=travel-payment \
  -e CURRENCY=USD \
  ubuntu:22.04

docker exec travel-envtest printenv APP_ENV PAYMENT_HOST CURRENCY
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + database) in one YAML file.

### Scenario

Deploy the travel staging stack: nginx frontend and MySQL database.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define two services: **`web`** and **`db`**.
3. Declare a named volume for MySQL data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9183:80` | on network `travel-compose-net` |
| `db` | `mysql:8.0` | (none on host) | password `TravelPass123`, volume `travel-mysql:/var/lib/mysql` |

| Resource | Name |
|----------|------|
| Volume | `travel-mysql` |
| Network | `travel-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9183
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9183:80"
    networks:
      - travel-compose-net

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: TravelPass123
    volumes:
      - travel-mysql:/var/lib/mysql
    networks:
      - travel-compose-net

volumes:
  travel-mysql:

networks:
  travel-compose-net:
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

Container `travel-crash` was started incorrectly and exits right away.

### Provided files

| File | Description |
|------|-------------|
| `broken-command.sh` | Shows the broken `docker run` command for reference |

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name travel-crash ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs travel-crash`, and `docker inspect travel-crash` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`travel-crash-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `travel-crash` |
| Fixed container name | `travel-crash-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=travel-crash-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name travel-crash ubuntu:22.04
docker ps -a --filter name=travel-crash
docker logs travel-crash

docker rm -f travel-crash
docker run -dit --name travel-crash-fixed ubuntu:22.04
docker ps --filter name=travel-crash-fixed
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
2. Create Linux user **`traveluser`** inside the image.
3. Add `USER traveluser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`travel-secure:v1`**, run container **`travel-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `traveluser` |
| Image tag | `travel-secure:v1` |
| Container name | `travel-secure` |

### How to verify

```bash
docker exec travel-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m traveluser
USER traveluser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t travel-secure:v1 .
docker run -d --name travel-secure travel-secure:v1
docker exec travel-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready travel portal edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `traveluser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env vars + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9184:8080` |
| Environment | `APP_ENV=production`, `REGION=eu-west` |
| Named volume | `travel-cache` mounted at `/var/cache/travel` |
| Network | `travel-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `traveluser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9184
docker volume ls | grep travel-cache
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D traveluser
USER traveluser
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
      - "9184:8080"
    environment:
      APP_ENV: production
      REGION: eu-west
    volumes:
      - travel-cache:/var/cache/travel
    networks:
      - travel-prod-net

volumes:
  travel-cache:

networks:
  travel-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9184
```

---
