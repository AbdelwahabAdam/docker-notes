# Docker Practice Exam 6 — Weather Dashboard

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`redis:7.2-alpine`** |
| Container | **`weather-cache`** |
| Ports | **`9580:6379`** |
| Restart | **`unless-stopped`** |

---

## Task 2 — Image Creation (FE widget)

### Provided

- `task02-widget/widget.html`

### Required

**`task02-widget/Dockerfile`**, **`nginx:1.25-alpine`**, build **`weather-widget:v1`**, port **`9581:80`**

---

## Task 3 — Persistent Storage

Volume **`weather-history`**, containers **`weather-hist1`** / **`weather-hist2`**, file **`/readings/2024-01-01.txt`**: `sunny,22C,humidity=45`

---

## Task 4 — Host Bind Mount (FE templates)

### Provided

- `task04-templates/index.html`

Bind **`task04-templates/`** → nginx web root, **`weather-live`**, **`9582:80`**, **`nginx:1.25-alpine`**

---

## Task 5 — Networking

Network **`weather-net`**:

- **`redis:7.2-alpine`** → **`weather-redis`**
- **`ubuntu:22.04`** → **`weather-db`**, **`weather-aggregator`**
- Aggregator pings **`weather-redis`** and **`weather-db`** by name

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.example`

**`weather-fetcher`**: `APP_ENV=staging`, `API_KEY=demo-key-123`, `CACHE_HOST=weather-redis`

---

## Task 7 — Docker Compose

**`task07-compose/docker-compose.yml`**:

| Service | Image |
|---------|-------|
| `web` | **`nginx:1.25-alpine`** → **`9583:80`** |
| `cache` | **`redis:7.2-alpine`** |
| `db` | **`postgres:15-alpine`**, password `weather123`, vol **`weather-pg`** |

Network **`weather-stack-net`**

---

## Task 8 — Troubleshooting

**`weather-collector`** exits → fix **`weather-collector-fixed`** (`ubuntu:22.04`, `-dit`)

---

## Task 9 — Security

User **`weatherapp`**, **`ubuntu:22.04`**, **`weather-secure:v1`**

---

## Task 10 — Production Challenge

**`task10-prod/`**: **`nginx:1.25-alpine`**, HEALTHCHECK, port **`9584:8080`**, volume **`weather-data:/data`**, network **`weather-prod-net`**
