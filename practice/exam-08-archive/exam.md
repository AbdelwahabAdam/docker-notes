# Docker Practice Exam 8 — Document Archive

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25-alpine`** |
| Container | **`archive-web`** |
| Ports | **`9780:80`** |
| Restart | **`unless-stopped`** |


### Answer

```bash
docker run -d --name archive-web -p 9780:80 --restart unless-stopped nginx
docker ps
```

---

## Task 2 — Image Creation (FE portal)

### Provided

- `portal.html`

**`Dockerfile.landing`**, build **`archive-portal:v1`**, port **`9781:80`**


### Answer

```dockerfile
FROM nginx
COPY portal.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /data/archive
echo "<h1>Archive Portal</h1>" > /data/archive/portal.html
cd /data/archive
docker build -t archive-portal:v1 .
docker run -d --name archive-portal -p 9781:80 archive-portal:v1
```

---

## Task 3 — Persistent Storage

### Provided (reference)

- `doc-001.idx`

Volume **`archive-index`**, **`archive-idx1`** / **`archive-idx2`**, file **`/index/doc-001.idx`**


### Answer

```bash
docker volume create archive-index
docker run -it --name archive-idx1 -v archive-index:/index ubuntu
echo "doc metadata" > /index/doc-001.idx && exit
docker rm -f archive-idx1
docker run -it --name archive-idx2 -v archive-index:/index ubuntu
cat /index/doc-001.idx
```

---

## Task 4 — Host Bind Mount (FE inbox)

### Provided

- `inbox-index.html`

**`archive-inbox`**, **`9782:80`**, bind **`./`** → **`/usr/share/nginx/html`**


### Answer

```bash
mkdir -p /data/archive/inbox
echo "<h1>Inbox</h1>" > /data/archive/inbox/index.html
docker run -d --name archive-inbox -p 9782:80 \
  -v /data/archive/inbox:/usr/share/nginx/html nginx
echo "<p>New doc</p>" >> /data/archive/inbox/index.html
```

---

## Task 5 — Networking

**`archive-net`**: **`ubuntu:22.04`** → **`archive-search`**, **`archive-indexer`**, ping by hostname


### Answer

```bash
docker network create archive-net
docker run -dit --name archive-search --network archive-net ubuntu
docker run -dit --name archive-indexer --network archive-net ubuntu
docker exec archive-indexer ping -c 2 archive-search
```

---

## Task 6 — Environment Variables

**`archive-proc`**: `APP_ENV=production`, `SEARCH_HOST=archive-search`, `RETENTION_DAYS=365`


### Answer

```bash
docker run -dit --name archive-proc \
  -e APP_ENV=production \
  -e SEARCH_HOST=archive-search \
  -e RETENTION_DAYS=365 \
  ubuntu
docker exec archive-proc printenv
```

---

## Task 7 — Docker Compose

**`docker-compose.staging.yml`**:

| Service | Image |
|---------|-------|
| `web` | **`nginx:1.25-alpine`** → **`9783:80`** |
| `db` | **`postgres:15-alpine`**, password `archive123`, vol **`archive-pg`** |
| `cache` | **`redis:7.2-alpine`** |

Network **`archive-compose-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9783:80"
    networks:
      - archive-compose-net
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: archive123
    volumes:
      - archive-pg:/var/lib/postgresql/data
    networks:
      - archive-compose-net
  cache:
    image: redis
    networks:
      - archive-compose-net
volumes:
  archive-pg:
networks:
  archive-compose-net:
```

---

## Task 8 — Troubleshooting

**`archive-scanner`** → **`archive-scanner-fixed`**


### Answer

```bash
docker logs archive-scanner
docker rm -f archive-scanner
docker run -dit --name archive-scanner ubuntu
```

---

## Task 9 — Security

User **`archiveuser`**, **`ubuntu:22.04`**, **`archive-secure:v1`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd archiveuser
USER archiveuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t archive-secure:v1 .
docker run -d --name archive-secure archive-secure:v1
docker exec archive-secure id
```

---

## Task 10 — Production Challenge

****exam root****: HEALTHCHECK, **`9784:8080`**, volume **`archive-data:/archive`**, network **`archive-prod-net`**, user **`archiveuser`**

### Answer

```dockerfile
FROM nginx
RUN useradd archiveuser
USER archiveuser
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9784:8080"
    environment:
      APP_ENV: production
    volumes:
      - archive-data:/archive
    networks:
      - archive-prod-net
volumes:
  archive-data:
networks:
  archive-prod-net:
```

```bash
docker compose up -d
docker inspect $(docker compose ps -q)
```

---
