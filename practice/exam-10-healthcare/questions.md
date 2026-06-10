# Docker Practice Exam 10 — Healthcare Patient Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25.3-alpine`** (tag: `stable-alpine` OK) |
| Container | **`health-portal-web`** |
| Ports | **`9980:80`** |
| Restart | **`unless-stopped`** |

### Verify

```bash
docker ps --filter name=health-portal-web
docker inspect health-portal-web --format='{{.HostConfig.RestartPolicy.Name}}'
```

---

## Task 2 — Image Creation (FE)

### Provided

- `task02-welcome/welcome.html`

### Required

1. **`task02-welcome/Dockerfile`**, base **`nginx:1.25-alpine`**
2. Build **`health-welcome:v1`**
3. Tag also as **`health-welcome:latest`**: `docker tag health-welcome:v1 health-welcome:latest`
4. Run **`health-welcome`**, **`9981:80`**

---

## Task 3 — Persistent Storage

Volume **`health-audit`**, **`health-audit1`** / **`health-audit2`**, file **`/audit/access.log`**: `2024-06-10 user=admin action=login`

---

## Task 4 — Host Bind Mount (compliance docs, read-only)

### Provided

- `task04-docs/policy.html`

**`health-docs`**, **`nginx:1.25-alpine`**, **`9982:80`**, bind **`task04-docs/`** → **`/usr/share/nginx/html:ro`**

Confirm container **cannot** modify host files.

---

## Task 5 — Networking (BE → DB)

### Provided (BE reference — optional to containerize)

- `task05-be/server.js`

### Required

1. Network **`health-net`**
2. **`postgres:15.5-alpine`** as **`health-db`**, env `POSTGRES_PASSWORD=health123`
3. **`ubuntu:22.04`** as **`health-api`** on `health-net`
4. Ping/resolve **`health-db`** from **`health-api`**

---

## Task 6 — Environment Variables

### Provided

- `task06/health.env` (contains `AUDIT_ENABLED=true`)

**`health-app-env`** (`ubuntu:22.04`):

- `--env-file task06/health.env`
- Plus inline: `APP_ENV=production`, `DB_HOST=health-db`, `DB_PORT=5432`

Verify all four variables.

---

## Task 7 — Docker Compose (FE + Postgres + Redis)

**`task07-compose/docker-compose.yml`**:

| Service | Image | Details |
|---------|-------|---------|
| `web` | **`nginx:1.25-alpine`** | **`9983:80`**, `depends_on: [db, cache]` |
| `db` | **`postgres:15.5-alpine`** | password `health123`, vol **`health-pg:/var/lib/postgresql/data`** |
| `cache` | **`redis:7.2-alpine`** | **`restart: always`** |

Network **`health-compose-net`**

---

## Task 8 — Troubleshooting

Reproduce: `docker run --name health-sync ubuntu:22.04`

Fix **`health-sync-fixed`**, document root cause in **`task08-troubleshooting/root-cause.txt`**

---

## Task 9 — Security

**`task09-security/Dockerfile`**: **`nginx:1.25-alpine`**, user **`healthuser`**

> Note: If nginx fails as non-root on port 80, use `CMD ["sleep", "infinity"]` for this exercise and document why.

Build **`health-secure:v1`**, run **`health-secure`**, verify UID ≠ 0.

---

## Task 10 — Production Deployment Challenge

### Provided

- `task10-prod/fe/index.html`

### Required — create in `task10-prod/`

| File | Specification |
|------|---------------|
| **`Dockerfile`** | **`nginx:1.25-alpine`**, copy `fe/`, user **`healthuser`**, `HEALTHCHECK CMD wget -qO- http://localhost \|\| exit 1` |
| **`.dockerignore`** | Exclude `.env`, `docker-compose*`, `.git` |
| **`docker-compose.yml`** | Port **`9984:8080`**, env `APP_ENV=production`, `COMPLIANCE_MODE=strict`, volume **`health-prod-data:/data`**, network **`health-prod-net`**, restart **`unless-stopped`** |

### Verify

```bash
docker compose -f task10-prod/docker-compose.yml up -d --build
docker inspect --format='{{.State.Health.Status}}' $(docker compose -f task10-prod/docker-compose.yml ps -q)
```

---

## Bonus (Optional)

Create **`docker-compose.yml`** + **`docker-compose.prod.yml`** + **`docker-compose.dev.yml`**:

- Prod: port 9984, `APP_ENV=production`
- Dev: bind mount `./fe:/usr/share/nginx/html:ro`, `APP_ENV=development`

Deploy: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
