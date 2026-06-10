# Docker Practice Exam 3 — Fitness Tracker API

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

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

---

## Task 2 — Image Creation (FE health page)

### Provided

- `task02-health/health.html`

### Required

1. **`task02-health/Dockerfile`**, base **`nginx:1.25-alpine`**
2. Copy `health.html` → `/usr/share/nginx/html/index.html`
3. Build **`fitness-health:v1`**, run **`fitness-health`**, port **`9281:80`**

---

## Task 3 — Persistent Storage

### Required

1. Volume **`fitness-logs`**
2. **`ubuntu:22.04`**: `fitness-log1` → `/logs`, write `/logs/workout-day1.txt` with `5km run;duration=28min`
3. Replace with **`fitness-log2`**, verify persistence

---

## Task 4 — Host Bind Mount (config)

### Provided

- `task04-config/settings.json`

### Required

1. **`ubuntu:22.04`** container **`fitness-config`**
2. Bind mount **`task04-config/`** → **`/app/config:ro`** (read-only)
3. Verify JSON visible; confirm write inside container fails

```bash
docker exec fitness-config cat /app/config/settings.json
```

---

## Task 5 — Networking

### Required

1. Network **`fitness-net`**
2. **`redis:7.2-alpine`** as **`fitness-cache`** on `fitness-net`
3. **`ubuntu:22.04`** as **`fitness-api`** on `fitness-net`
4. Ping **`fitness-cache`** from API container by name

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.example`

### Required

Container **`fitness-env`** (`ubuntu:22.04`, `-dit`):

- `APP_ENV=development`
- `REDIS_HOST=fitness-cache`
- `LOG_LEVEL=debug`

---

## Task 7 — Docker Compose (FE + Redis + Mongo)

Create **`task07-compose/docker-compose.yml`**:

| Service | Image | Details |
|---------|-------|---------|
| `web` | **`nginx:1.25-alpine`** | **`9283:80`**, network `fitness-stack-net` |
| `redis` | **`redis:7.2-alpine`** | No host port required |
| `mongo` | **`mongo:7.0`** | `MONGO_INITDB_ROOT_USERNAME=root`, `MONGO_INITDB_ROOT_PASSWORD=fitness123`, volume **`fitness-mongo:/data/db`** |

---

## Task 8 — Troubleshooting

1. Reproduce: `docker run --name fitness-worker ubuntu:22.04`
2. Fix with **`fitness-worker-fixed`** (`ubuntu:22.04`, `-dit`)
3. Document in **`task08-troubleshooting/root-cause.txt`**

---

## Task 9 — Security

- **`task09-security/Dockerfile`**, **`ubuntu:22.04`**, user **`fitnessapp`**
- Build **`fitness-secure:v1`**, container **`fitness-secure`**

---

## Task 10 — Production Challenge

### Provided

Create FE placeholder or use nginx default.

### Required in `task10-prod/`

- `Dockerfile`: **`nginx:1.25-alpine`**, user **`fitnessapp`**, HEALTHCHECK
- `docker-compose.yml`: port **`9284:8080`**, env `APP_ENV=production`, `METRICS_ENABLED=true`, volume **`fitness-metrics-data:/data`**, network **`fitness-prod-net`**, restart **`unless-stopped`**
