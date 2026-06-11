# Docker Practice Exam 4 — Photo Gallery Service

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25.3-alpine`** (stable-alpine acceptable: `nginx:stable-alpine`) |
| Container | **`gallery-web`** |
| Ports | **`9380:80`** |
| Restart | **`on-failure`** |
| Mode | `-d` |


### Answer

```bash
docker run -d --name gallery-web -p 9380:80 --restart on-failure nginx:stable-alpine
docker ps
```

---

## Task 2 — Image Creation (FE)

### Provided

- `welcome.html`

### Required

1. **`Dockerfile.landing`**, base **`nginx:1.25-alpine`**
2. Copy `welcome.html` → `/usr/share/nginx/html/index.html`
3. Build **`gallery-welcome:v1`**, run **`gallery-welcome`**, **`9381:80`**


### Answer

```dockerfile
FROM nginx
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /srv/gallery
echo "<h1>Gallery</h1>" > /srv/gallery/welcome.html
cd /srv/gallery
docker build -t gallery-welcome:v1 .
docker run -d --name gallery-welcome -p 9381:80 gallery-welcome:v1
```

---

## Task 3 — Persistent Storage

### Provided (sample metadata reference)

- `album-001.json`

### Required

1. Volume **`gallery-meta`**
2. `gallery-store1` (`ubuntu:22.04`) → `/metadata`
3. Create **`/metadata/album-001.json`** (use provided content or equivalent)
4. Swap to **`gallery-store2`**, verify JSON file


### Answer

```bash
docker volume create gallery-meta
docker run -it --name gallery-store1 -v gallery-meta:/metadata ubuntu
echo '{"album":1}' > /metadata/album-001.json && exit
docker rm -f gallery-store1
docker run -it --name gallery-store2 -v gallery-meta:/metadata ubuntu
cat /metadata/album-001.json
```

---

## Task 4 — Host Bind Mount (FE + assets)

### Provided

- `public-index.html`

### Required

1. Bind mount **`./`** → **`/usr/share/nginx/html`**
2. **`nginx:1.25-alpine`**, **`gallery-public`**, **`9382:80`**
3. Add new paragraph to `index.html` on host; verify without rebuild


### Answer

```bash
mkdir -p /srv/gallery/public
echo "<img src='sample.jpg'>" > /srv/gallery/public/index.html
docker run -d --name gallery-public -p 9382:80 \
  -v /srv/gallery/public:/usr/share/nginx/html nginx
echo "<p>New photo</p>" >> /srv/gallery/public/index.html
```

---

## Task 5 — Networking

1. Network **`gallery-net`**
2. **`ubuntu:22.04`**: **`gallery-storage`**, **`gallery-worker`** on `gallery-net`
3. Ping **`gallery-storage`** from worker


### Answer

```bash
docker network create gallery-net
docker run -dit --name gallery-storage --network gallery-net ubuntu
docker run -dit --name gallery-worker --network gallery-net ubuntu
docker exec gallery-worker ping -c 2 gallery-storage
```

---

## Task 6 — Environment Variables

Container **`gallery-env`** (`ubuntu:22.04`):

- `APP_ENV=production`
- `STORAGE_HOST=gallery-storage`
- `MAX_UPLOAD_MB=50`


### Answer

```bash
docker run -dit --name gallery-env \
  -e APP_ENV=production \
  -e STORAGE_HOST=gallery-storage \
  -e MAX_UPLOAD_MB=50 \
  ubuntu
docker exec gallery-env printenv
```

---

## Task 7 — Docker Compose (FE + Postgres + Redis)

**`docker-compose.staging.yml`**:

| Service | Image | Port / volume |
|---------|-------|---------------|
| `web` | **`nginx:1.25-alpine`** | **`9383:80`** |
| `db` | **`postgres:15.5-alpine`** | `POSTGRES_PASSWORD=gallery123`, vol **`gallery-pg:/var/lib/postgresql/data`** |
| `cache` | **`redis:7.2-alpine`** | internal only |

Network: **`gallery-compose-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9383:80"
    networks:
      - gallery-compose-net
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: gallery123
    volumes:
      - gallery-pg:/var/lib/postgresql/data
    networks:
      - gallery-compose-net
  cache:
    image: redis:7-alpine
    networks:
      - gallery-compose-net
volumes:
  gallery-pg:
networks:
  gallery-compose-net:
```

---

## Task 8 — Troubleshooting

Reproduce `docker run --name gallery-uploader ubuntu:22.04` → fix as **`gallery-uploader-fixed`**


### Answer

```bash
docker logs gallery-uploader
docker rm -f gallery-uploader
docker run -dit --name gallery-uploader ubuntu
```

---

## Task 9 — Security

**`Dockerfile.secure`**: **`ubuntu:22.04`**, user **`galleryuser`**, build **`gallery-secure:v1`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd galleryuser
USER galleryuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t gallery-secure:v1 .
docker run -d --name gallery-secure gallery-secure:v1
docker exec gallery-secure id
```

---

## Task 10 — Production Challenge

****exam root**** (*student-created*):

- `Dockerfile`: **`nginx:stable-alpine`**, **`galleryuser`**, HEALTHCHECK
- `docker-compose.yml`: **`9384:8080`**, env `APP_ENV=production`, `CDN_REGION=us-east`, volume **`gallery-cache:/cache`**, network **`gallery-prod-net`**

### Answer

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D galleryuser
USER galleryuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9384:8080"
    environment:
      APP_ENV: production
      CDN_REGION: us-east
    volumes:
      - gallery-cache:/cache
    networks:
      - gallery-prod-net
volumes:
  gallery-cache:
networks:
  gallery-prod-net:
```

```bash
docker compose up -d
docker ps && docker volume ls && docker network ls
```

---
