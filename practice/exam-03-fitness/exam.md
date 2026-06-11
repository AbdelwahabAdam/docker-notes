# Docker Practice Exam 3 — Fitness Tracker API

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

### Required

| Setting | Value |
|---------|-------|
| Image | **`redis:7.2-alpine`** |
| Container | **`fitness-redis`** |
| Ports | **`9280:6379`** |
| Restart | **`always`** |
| Mode | Detached |

### Verify

```bash
docker exec fitness-redis redis-cli ping
# PONG
```


### Answer

```bash
docker run -d --name fitness-redis -p 9280:6379 --restart always redis:7-alpine
docker ps
```

---

## Task 2 — Image Creation (FE health page)

### Provided

- `health.html`

### Required

1. **`Dockerfile.landing`**, base **`nginx:1.25-alpine`**
2. Copy `health.html` → `/usr/share/nginx/html/index.html`
3. Build **`fitness-health:v1`**, run **`fitness-health`**, port **`9281:80`**


### Answer

```dockerfile
FROM nginx:alpine
COPY health.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing
docker build -t fitness-health:v1 .
docker run -d --name fitness-health -p 9281:80 fitness-health:v1
```

---

## Task 3 — Persistent Storage

### Required

1. Volume **`fitness-logs`**
2. **`ubuntu:22.04`**: `fitness-log1` → `/logs`, write `/logs/workout-day1.txt` with `5km run;duration=28min`
3. Replace with **`fitness-log2`**, verify persistence


### Answer

```bash
docker volume create fitness-logs
docker run -it --name fitness-log1 -v fitness-logs:/logs ubuntu
echo "5km run" > /logs/workout-day1.txt && exit
docker rm -f fitness-log1
docker run -it --name fitness-log2 -v fitness-logs:/logs ubuntu
cat /logs/workout-day1.txt
```

---

## Task 4 — Host Bind Mount (config)

### Provided

- `settings.json`

### Required

1. **`ubuntu:22.04`** container **`fitness-config`**
2. Bind mount **`./`** → **`/app/config:ro`** (read-only)
3. Verify JSON visible; confirm write inside container fails

```bash
docker exec fitness-config cat /app/config/settings.json
```


### Answer

```bash
mkdir -p /home/fitness/config
echo '{"debug":true}' > /home/fitness/config/settings.json
docker run -dit --name fitness-config \
  -v /home/fitness/config:/app/config:ro ubuntu
docker exec fitness-config cat /app/config/settings.json
```

---

## Task 5 — Networking

### Required

1. Network **`fitness-net`**
2. **`redis:7.2-alpine`** as **`fitness-cache`** on `fitness-net`
3. **`ubuntu:22.04`** as **`fitness-api`** on `fitness-net`
4. Ping **`fitness-cache`** from API container by name


### Answer

```bash
docker network create fitness-net
docker run -d --name fitness-cache --network fitness-net redis:7-alpine
docker run -dit --name fitness-api --network fitness-net ubuntu
docker exec fitness-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 fitness-cache"
```

---

## Task 6 — Environment Variables

### Provided

- `env.example`

### Required

Container **`fitness-env`** (`ubuntu:22.04`, `-dit`):

- `APP_ENV=development`
- `REDIS_HOST=fitness-cache`
- `LOG_LEVEL=debug`


### Answer

```bash
docker run -dit --name fitness-env \
  -e APP_ENV=development \
  -e REDIS_HOST=fitness-cache \
  -e LOG_LEVEL=debug \
  ubuntu
docker exec fitness-env printenv | grep -E 'APP|REDIS|LOG'
```

---

## Task 7 — Docker Compose (FE + Redis + Mongo)

Create **`docker-compose.staging.yml`**:

| Service | Image | Details |
|---------|-------|---------|
| `web` | **`nginx:1.25-alpine`** | **`9283:80`**, network `fitness-stack-net` |
| `redis` | **`redis:7.2-alpine`** | No host port required |
| `mongo` | **`mongo:7.0`** | `MONGO_INITDB_ROOT_USERNAME=root`, `MONGO_INITDB_ROOT_PASSWORD=fitness123`, volume **`fitness-mongo:/data/db`** |


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9283:80"
    networks:
      - fitness-stack-net
  redis:
    image: redis:7-alpine
    networks:
      - fitness-stack-net
  mongo:
    image: mongo:6
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

---

## Task 8 — Troubleshooting

1. Reproduce: `docker run --name fitness-worker ubuntu:22.04`
2. Fix with **`fitness-worker-fixed`** (`ubuntu:22.04`, `-dit`)
3. Document in **`root-cause.txt`**


### Answer

```bash
docker logs fitness-worker
docker rm -f fitness-worker
docker run -dit --name fitness-worker ubuntu
```

**Root cause:** `docker run ubuntu` exits when default command completes.

---

## Task 9 — Security

- **`Dockerfile.secure`**, **`ubuntu:22.04`**, user **`fitnessapp`**
- Build **`fitness-secure:v1`**, container **`fitness-secure`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd fitnessapp
USER fitnessapp
CMD ["sleep", "infinity"]
```

```bash
docker build -t fitness-secure:v1 .
docker run -d --name fitness-secure fitness-secure:v1
docker exec fitness-secure id
```

---

## Task 10 — Production Challenge

### Provided

Create FE placeholder or use nginx default.

### Required in **exam root**

- `Dockerfile`: **`nginx:1.25-alpine`**, user **`fitnessapp`**, HEALTHCHECK
- `docker-compose.yml`: port **`9284:8080`**, env `APP_ENV=production`, `METRICS_ENABLED=true`, volume **`fitness-metrics-data:/data`**, network **`fitness-prod-net`**, restart **`unless-stopped`**

### Answer

```dockerfile
FROM nginx:alpine
RUN adduser -D fitnessapp
USER fitnessapp
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
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

---
