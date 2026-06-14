# Docker Practice Exam 5 — Inventory Management

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  
**Folder:** `exam-05-inventory/` — run all commands from this directory.

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

> **Windows bind mounts:** `G:/Devops_Hopa/Docker/practice/exam-05-inventory`

---

## Task 1 — Container Deployment

### Goal

Run a pre-built MariaDB container in the background with a restart policy.

### Scenario

The warehouse team needs a temporary database for inventory testing.

### What you must do

1. Pull the image if you do not have it locally.
2. Run MariaDB as a **detached** container (`-d`) with the root password set.
3. Confirm the container stays **Up** after starting.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `mariadb:10.11` |
| Container name | `inventory-db-temp` |
| Port mapping (host:container) | `9480:3306` |
| Environment | `MARIADB_ROOT_PASSWORD=warehouse123` |
| Restart policy | `unless-stopped` |
| Detached | Yes (`-d`) |

### How to verify

```bash
docker ps --filter name=inventory-db-temp
docker exec inventory-db-temp mariadb-admin ping -pwarehouse123
```

### Answer

```bash
docker pull mariadb:10.11
docker run -d \
  --name inventory-db-temp \
  -e MARIADB_ROOT_PASSWORD=warehouse123 \
  -p 9480:3306 \
  --restart unless-stopped \
  mariadb:10.11

docker ps --filter name=inventory-db-temp
```

---

## Task 2 — Image Creation (dashboard page)

### Goal

Build a **custom Docker image** from a Dockerfile and run a container from it.

### Scenario

Operations needs an inventory dashboard packaged as an image for consistent deployment.

### Provided files

| File | Description |
|------|-------------|
| `dashboard.html` | Inventory dashboard page — will be copied into the image |

### What you must do

1. Create a file named **`Dockerfile.landing`** in this folder.
2. Use **`nginx:1.25-alpine`** as the base image.
3. Copy `dashboard.html` into the image as **`/usr/share/nginx/html/index.html`**.
4. Build the image with tag **`inventory-dash:v1`**.
5. Run a container named **`inventory-dash`** from that image on port **`9481:80`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile name | `Dockerfile.landing` |
| Base image | `nginx:1.25-alpine` |
| Image tag | `inventory-dash:v1` |
| Container name | `inventory-dash` |
| Port mapping | `9481:80` |

### How to verify

```bash
docker images inventory-dash
curl http://localhost:9481
```

### Answer

Create `Dockerfile.landing`:

```dockerfile
FROM nginx:1.25-alpine
COPY dashboard.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing -t inventory-dash:v1 .
docker run -d --name inventory-dash -p 9481:80 inventory-dash:v1
curl http://localhost:9481
```

---

## Task 3 — Persistent Storage (named volume)

### Goal

Store data in a **named Docker volume** so it survives when the container is deleted.

### Scenario

Stock counts must not be lost when the storage container is replaced.

### What you must do

1. Create a named volume called **`inventory-stock`**.
2. Start container **`inv-store-a`** from **`ubuntu:22.04`** with `-it`.
3. Mount volume **`inventory-stock`** at **`/stock`** inside the container.
4. Inside the container, create file **`/stock/count.txt`** with content: `items=500;warehouse=A`
5. Exit, then **remove** container `inv-store-a` completely.
6. Start a **new** container **`inv-store-b`** (same image, same volume, same mount path).
7. Prove the file still exists inside `inv-store-b`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Volume name | `inventory-stock` |
| Mount path (inside container) | `/stock` |
| First container name | `inv-store-a` |
| Second container name | `inv-store-b` |
| Image | `ubuntu:22.04` |

### How to verify

```bash
docker volume inspect inventory-stock
docker exec inv-store-b cat /stock/count.txt
```

### Answer

```bash
docker volume create inventory-stock

docker run -it --name inv-store-a \
  -v inventory-stock:/stock \
  ubuntu:22.04
# inside container:
echo "items=500;warehouse=A" > /stock/count.txt
exit

docker rm -f inv-store-a

docker run -it --name inv-store-b \
  -v inventory-stock:/stock \
  ubuntu:22.04
# inside container:
cat /stock/count.txt
exit
```

---

## Task 4 — Host Bind Mount (live dashboard)

### Goal

Mount a **host folder** into a container so file changes on your machine appear instantly inside nginx — **no rebuild**.

### Scenario

Operations edits the inventory dashboard on their laptop. Nginx should serve those files directly from disk during development.

### Provided files

| File | Description |
|------|-------------|
| `dashboard.html` | Dashboard page — you must copy it to `index.html` (nginx default page) |
| `items.csv` | Sample CSV import file — also in this folder when the whole folder is mounted |

### What you must do

**Step A — Prepare the host folder**

1. In this folder (`exam-05-inventory/`), copy `dashboard.html` to a new file named **`index.html`**:
   ```bash
   cp dashboard.html index.html
   ```

**Step B — Run nginx with bind mount**

2. Run an nginx container that **bind-mounts this entire folder** into nginx's web root.
3. The left side of the volume is your **host path** (this exam folder).
4. The right side inside the container is **`/usr/share/nginx/html`** (where nginx serves files).

**Step C — Test live editing**

5. Edit `index.html` on your host (add a new inventory metric).
6. Run `curl http://localhost:9482` again — you must see the change **without** running `docker build`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `nginx:1.25-alpine` |
| Container name | `inventory-live` |
| Port mapping (host:container) | `9482:80` |
| Bind mount (host path) | This exam folder — e.g. `G:/Devops_Hopa/Docker/practice/exam-05-inventory` |
| Bind mount (container path) | `/usr/share/nginx/html` |
| Detached | Yes (`-d`) |

**Example `docker run` flags for Step B:**

```text
--name inventory-live
-p 9482:80
-v <HOST_PATH_TO_exam-05-inventory>:/usr/share/nginx/html
```

### How to verify

```bash
curl http://localhost:9482
docker ps --filter name=inventory-live
# edit index.html on host, then:
curl http://localhost:9482
```

### Answer

```bash
cp dashboard.html index.html

docker run -d \
  --name inventory-live \
  -p 9482:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-05-inventory:/usr/share/nginx/html \
  nginx:1.25-alpine

curl http://localhost:9482
# edit index.html on host, then:
curl http://localhost:9482
```

---

## Task 5 — Networking (container DNS)

### Goal

Two containers on a **custom network** must reach each other **by container name** (Docker DNS).

### Scenario

The inventory API must connect to MariaDB using the hostname `inventory-mariadb` — not a hardcoded IP address.

### What you must do

1. Create a Docker network named **`inventory-net`**.
2. Start **`inventory-mariadb`** from image **`mariadb:10.11`** on network `inventory-net` with `MARIADB_ROOT_PASSWORD=pass` (detached).
3. Start **`inventory-api`** from image **`ubuntu:22.04`** on network `inventory-net` (detached + TTY: `-dit`).
4. Inside `inventory-api`, verify hostname **`inventory-mariadb`** resolves (use `getent hosts inventory-mariadb`).

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Network name | `inventory-net` |
| DB container name | `inventory-mariadb` |
| DB image | `mariadb:10.11` |
| DB password | `pass` |
| API container name | `inventory-api` |
| API image | `ubuntu:22.04` |

### How to verify

```bash
docker network inspect inventory-net
docker exec inventory-api getent hosts inventory-mariadb
```

### Answer

```bash
docker network create inventory-net

docker run -d \
  --name inventory-mariadb \
  --network inventory-net \
  -e MARIADB_ROOT_PASSWORD=pass \
  mariadb:10.11

docker run -dit \
  --name inventory-api \
  --network inventory-net \
  ubuntu:22.04

docker exec inventory-api getent hosts inventory-mariadb
```

---

## Task 6 — Environment Variables

### Goal

Pass configuration into a container at **runtime** using `-e` flags.

### Scenario

The inventory sync service reads settings from environment variables instead of hardcoded values.

### Provided files

| File | Description |
|------|-------------|
| `env.example` | Reference — shows variable names (you set values via `-e`) |

### What you must do

1. Run container **`inventory-sync`** from **`ubuntu:22.04`** in detached mode (`-dit`).
2. Set these three environment variables using `-e`:
   - `APP_ENV=production`
   - `DB_HOST=inventory-mariadb`
   - `SYNC_INTERVAL=300`
3. Verify all three variables exist inside the container.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image | `ubuntu:22.04` |
| Container name | `inventory-sync` |
| `APP_ENV` | `production` |
| `DB_HOST` | `inventory-mariadb` |
| `SYNC_INTERVAL` | `300` |

### How to verify

```bash
docker exec inventory-sync printenv APP_ENV DB_HOST SYNC_INTERVAL
```

### Answer

```bash
docker run -dit \
  --name inventory-sync \
  -e APP_ENV=production \
  -e DB_HOST=inventory-mariadb \
  -e SYNC_INTERVAL=300 \
  ubuntu:22.04

docker exec inventory-sync printenv APP_ENV DB_HOST SYNC_INTERVAL
```

---

## Task 7 — Docker Compose (multi-service stack)

### Goal

Define and run **multiple services** (web + mariadb + adminer) in one YAML file.

### Scenario

Deploy the inventory staging stack: nginx frontend, MariaDB database, and Adminer admin UI.

### What you must do

1. Create a file named **`docker-compose.staging.yml`** in this folder.
2. Define three services: **`web`**, **`db`**, **`adminer`**.
3. Declare a named volume for MariaDB data and a custom network.
4. Start everything with `docker compose -f docker-compose.staging.yml up -d`.

### Settings (use exactly these values)

| Service | Image | Ports | Other |
|---------|-------|-------|-------|
| `web` | `nginx:1.25-alpine` | `9483:80` | on network `inventory-compose-net` |
| `db` | `mariadb:10.11` | (none on host) | password `inv123`, volume `inventory-db:/var/lib/mysql` |
| `adminer` | `adminer:4` | `9485:8080` | on network `inventory-compose-net` |

| Resource | Name |
|----------|------|
| Volume | `inventory-db` |
| Network | `inventory-compose-net` |

### How to verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
curl http://localhost:9483
curl http://localhost:9485
```

### Answer

Create `docker-compose.staging.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9483:80"
    networks:
      - inventory-compose-net

  db:
    image: mariadb:10.11
    environment:
      MARIADB_ROOT_PASSWORD: inv123
    volumes:
      - inventory-db:/var/lib/mysql
    networks:
      - inventory-compose-net

  adminer:
    image: adminer:4
    ports:
      - "9485:8080"
    networks:
      - inventory-compose-net

volumes:
  inventory-db:

networks:
  inventory-compose-net:
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

Container `inventory-cron` was started incorrectly and exits right away.

### What you must do

1. Run this command to reproduce the problem:
   ```bash
   docker run --name inventory-cron ubuntu:22.04
   ```
2. Use `docker ps -a`, `docker logs inventory-cron`, and `docker inspect inventory-cron` to investigate.
3. Remove the broken container.
4. Start a **fixed** container named **`inventory-cron-fixed`** that **stays running**.
5. Write one sentence explaining the root cause in **`root-cause.txt`**.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Broken container name | `inventory-cron` |
| Fixed container name | `inventory-cron-fixed` |
| Image | `ubuntu:22.04` |
| Fix hint | Container needs a long-running process — use `-dit` or `CMD sleep infinity` |

### How to verify

```bash
docker ps --filter name=inventory-cron-fixed
cat root-cause.txt
```

### Answer

```bash
docker run --name inventory-cron ubuntu:22.04
docker ps -a --filter name=inventory-cron
docker logs inventory-cron

docker rm -f inventory-cron
docker run -dit --name inventory-cron-fixed ubuntu:22.04
docker ps --filter name=inventory-cron-fixed
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
2. Create Linux user **`invuser`** inside the image.
3. Add `USER invuser` so the container runs as that user.
4. Set `CMD ["sleep", "infinity"]` to keep the container alive.
5. Build image **`inventory-secure:v1`**, run container **`inventory-secure`**, verify UID is not `0`.

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Dockerfile | `Dockerfile.secure` |
| Base image | `ubuntu:22.04` |
| Username | `invuser` |
| Image tag | `inventory-secure:v1` |
| Container name | `inventory-secure` |

### How to verify

```bash
docker exec inventory-secure id
# uid must NOT be 0 (root)
```

### Answer

Create `Dockerfile.secure`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m invuser
USER invuser
CMD ["sleep", "infinity"]
```

```bash
docker build -f Dockerfile.secure -t inventory-secure:v1 .
docker run -d --name inventory-secure inventory-secure:v1
docker exec inventory-secure id
```

---

## Task 10 — Production Deployment Challenge

### Goal

Combine everything: custom Dockerfile, Compose, volumes, network, healthcheck, non-root user.

### Scenario

Deploy a production-ready inventory edge node with Docker Compose.

### Provided files

| File | Description |
|------|-------------|
| `prod-index.html` | Production frontend page — copy into image in your Dockerfile |

### What you must do

Create these files in **this folder**:

| File you create | Requirements |
|-----------------|--------------|
| `Dockerfile.prod` | Base `nginx:1.25-alpine`, copy `prod-index.html` to web root, user `invuser`, include `HEALTHCHECK` |
| `.dockerignore` | Exclude `.env`, `docker-compose*.yml`, `.git` |
| `docker-compose.prod.yml` | Build from `Dockerfile.prod`, restart `unless-stopped`, env + volume + network (see settings) |

### Settings (use exactly these values)

| Setting | Value |
|---------|-------|
| Image build file | `Dockerfile.prod` |
| Compose file | `docker-compose.prod.yml` |
| Port mapping | `9484:8080` |
| Environment | `APP_ENV=production` |
| Named volume | `inventory-reports` mounted at `/reports` |
| Network | `inventory-prod-net` |
| Restart policy | `unless-stopped` |
| Non-root user | `invuser` |

### How to verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9484
docker volume ls | grep inventory-reports
```

### Answer

`Dockerfile.prod`:

```dockerfile
FROM nginx:1.25-alpine
COPY prod-index.html /usr/share/nginx/html/index.html
RUN adduser -D invuser
USER invuser
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
      - "9484:8080"
    environment:
      APP_ENV: production
    volumes:
      - inventory-reports:/reports
    networks:
      - inventory-prod-net

volumes:
  inventory-reports:

networks:
  inventory-prod-net:
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://localhost:9484
```

---
