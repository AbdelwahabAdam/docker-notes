# Docker Practice Exam 10 — Healthcare Patient Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

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


### Answer

```bash
docker run -d \
  --name health-portal-web \
  -p 9980:80 \
  --restart unless-stopped \
  nginx:stable-alpine

docker ps
docker inspect health-portal-web
```

---

## Task 2 — Image Creation (FE)

### Provided

- `welcome.html`

### Required

1. **`Dockerfile.landing`**, base **`nginx:1.25-alpine`**
2. Build **`health-welcome:v1`**
3. Tag also as **`health-welcome:latest`**: `docker tag health-welcome:v1 health-welcome:latest`
4. Run **`health-welcome`**, **`9981:80`**


### Answer

```dockerfile
FROM nginx
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
docker build -f Dockerfile.landing
docker build -t health-welcome:v1 .
docker tag health-welcome:v1 health-welcome:latest
docker run -d --name health-welcome -p 9981:80 health-welcome:v1
docker images | grep health-welcome
```

---

## Task 3 — Persistent Storage

Volume **`health-audit`**, **`health-audit1`** / **`health-audit2`**, file **`/audit/access.log`**: `2024-06-10 user=admin action=login`


### Answer

```bash
docker volume create health-audit
docker run -it --name health-audit1 -v health-audit:/audit ubuntu
echo "user login 10:00" > /audit/access.log && exit
docker rm -f health-audit1
docker run -it --name health-audit2 -v health-audit:/audit ubuntu
cat /audit/access.log
```

---

## Task 4 — Host Bind Mount (compliance docs, read-only)

### Provided

- `policy.html`

**`health-docs`**, **`nginx:1.25-alpine`**, **`9982:80`**, bind **`./`** → **`/usr/share/nginx/html:ro`**

Confirm container **cannot** modify host files.


### Answer

```bash
docker run -d --name health-docs -p 9982:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-10-healthcare:/usr/share/nginx/html:ro \
  nginx:1.25-alpine
docker exec health-docs cat /usr/share/nginx/html/policy.html
```

---

## Task 5 — Networking (BE → DB)

### Provided (BE reference — optional to containerize)

- `api-server.js`

### Required

1. Network **`health-net`**
2. **`postgres:15.5-alpine`** as **`health-db`**, env `POSTGRES_PASSWORD=health123`
3. **`ubuntu:22.04`** as **`health-api`** on `health-net`
4. Ping/resolve **`health-db`** from **`health-api`**


### Answer

```bash
docker network create health-net
docker run -d --name health-db --network health-net \
  -e POSTGRES_PASSWORD=health123 postgres:15-alpine
docker run -dit --name health-api --network health-net ubuntu
docker exec health-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 health-db"
```

---

## Task 6 — Environment Variables

### Provided

- `health.env` (contains `AUDIT_ENABLED=true`)

**`health-app-env`** (`ubuntu:22.04`):

- `--env-file health.env`
- Plus inline: `APP_ENV=production`, `DB_HOST=health-db`, `DB_PORT=5432`

Verify all four variables.


### Answer

```bash
cat > health.env <<EOF
AUDIT_ENABLED=true
EOF

docker run -dit --name health-app-env \
  --env-file health.env \
  -e APP_ENV=production \
  -e DB_HOST=health-db \
  -e DB_PORT=5432 \
  ubuntu

docker exec health-app-env printenv | grep -E 'APP|DB|AUDIT'
```

---

## Task 7 — Docker Compose (FE + Postgres + Redis)

**`docker-compose.staging.yml`**:

| Service | Image | Details |
|---------|-------|---------|
| `web` | **`nginx:1.25-alpine`** | **`9983:80`**, `depends_on: [db, cache]` |
| `db` | **`postgres:15.5-alpine`** | password `health123`, vol **`health-pg:/var/lib/postgresql/data`** |
| `cache` | **`redis:7.2-alpine`** | **`restart: always`** |

Network **`health-compose-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9983:80"
    depends_on:
      - db
      - cache
    networks:
      - health-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: health123
    volumes:
      - health-pg:/var/lib/postgresql/data
    networks:
      - health-compose-net

  cache:
    image: redis
    restart: always
    networks:
      - health-compose-net

volumes:
  health-pg:

networks:
  health-compose-net:
```

```bash
docker compose up -d
docker compose ps
```

---

## Task 8 — Troubleshooting

Reproduce: `docker run --name health-sync ubuntu:22.04`

Fix **`health-sync-fixed`**, document root cause in **`root-cause.txt`**


### Answer

```bash
docker ps -a | grep health-sync
docker logs health-sync
docker inspect health-sync --format='{{.State.ExitCode}}'

docker rm -f health-sync
docker run -dit --name health-sync ubuntu
docker ps
```

**Root cause:** Container started without a persistent foreground process (e.g. `docker run ubuntu` exits immediately).

---

## Task 9 — Security

**`Dockerfile.secure`**: **`nginx:1.25-alpine`**, user **`healthuser`**

> Note: If nginx fails as non-root on port 80, use `CMD ["sleep", "infinity"]` for this exercise and document why.

Build **`health-secure:v1`**, run **`health-secure`**, verify UID ≠ 0.


### Answer

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
CMD ["nginx", "-g", "daemon off;"]
```

Note: nginx normally needs root to bind port 80; for exam purposes use sleep pattern if nginx fails:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t health-secure:v1 .
docker run -d --name health-secure health-secure:v1
docker exec health-secure id
```

---

## Task 10 — Production Deployment Challenge

### Provided

- `prod-index.html`

### Required — create in **exam root**

| File | Specification |
|------|---------------|
| **`Dockerfile`** | **`nginx:1.25-alpine`**, copy `fe/`, user **`healthuser`**, `HEALTHCHECK CMD wget -qO- http://localhost \|\| exit 1` |
| **`.dockerignore`** | Exclude `.env`, `docker-compose*`, `.git` |
| **`docker-compose.yml`** | Port **`9984:8080`**, env `APP_ENV=production`, `COMPLIANCE_MODE=strict`, volume **`health-prod-data:/data`**, network **`health-prod-net`**, restart **`unless-stopped`** |

### Verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker inspect --format='{{.State.Health.Status}}' $(docker compose -f docker-compose.prod.yml ps -q)
```

---

## Bonus (Optional)

Create **`docker-compose.yml`** + **`docker-compose.prod.yml`** + **`docker-compose.dev.yml`**:

- Prod: port 9984, `APP_ENV=production`
- Dev: bind mount `./fe:/usr/share/nginx/html:ro`, `APP_ENV=development`

Deploy: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`

### Answer

`.dockerignore`:

```
.env
docker-compose*
.git
```

Dockerfile:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

`docker-compose.yml`:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9984:8080"
    environment:
      APP_ENV: production
      COMPLIANCE_MODE: strict
    volumes:
      - health-prod-data:/data
    networks:
      - health-prod-net

volumes:
  health-prod-data:

networks:
  health-prod-net:
```

Deploy and verify:

```bash
docker compose up -d --build
docker ps
docker volume ls
docker network ls
docker inspect $(docker compose ps -q)
docker inspect --format='{{.State.Health.Status}}' $(docker compose ps -q)
```

---

## Bonus — Multi-Environment Compose

`docker-compose.yml` (base):

```yaml
services:
  app:
    build: .
    networks:
      - health-net
    volumes:
      - health-data:/data
volumes:
  health-data:
networks:
  health-net:
```

`docker-compose.prod.yml`:

```yaml
services:
  app:
    restart: unless-stopped
    ports:
      - "9984:8080"
    environment:
      APP_ENV: production
```

`docker-compose.dev.yml`:

```yaml
services:
  app:
    volumes:
      - ./src:/app/src:ro
    environment:
      APP_ENV: development
```

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

---
