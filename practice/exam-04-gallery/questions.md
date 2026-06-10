# Docker Practice Exam 4 — Photo Gallery Service

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25.3-alpine`** (stable-alpine acceptable: `nginx:stable-alpine`) |
| Container | **`gallery-web`** |
| Ports | **`9380:80`** |
| Restart | **`on-failure`** |
| Mode | `-d` |

---

## Task 2 — Image Creation (FE)

### Provided

- `task02-welcome/welcome.html`

### Required

1. **`task02-welcome/Dockerfile`**, base **`nginx:1.25-alpine`**
2. Copy `welcome.html` → `/usr/share/nginx/html/index.html`
3. Build **`gallery-welcome:v1`**, run **`gallery-welcome`**, **`9381:80`**

---

## Task 3 — Persistent Storage

### Provided (sample metadata reference)

- `task03-sample/album-001.json`

### Required

1. Volume **`gallery-meta`**
2. `gallery-store1` (`ubuntu:22.04`) → `/metadata`
3. Create **`/metadata/album-001.json`** (use provided content or equivalent)
4. Swap to **`gallery-store2`**, verify JSON file

---

## Task 4 — Host Bind Mount (FE + assets)

### Provided

- `task04-public/index.html`

### Required

1. Bind mount **`task04-public/`** → **`/usr/share/nginx/html`**
2. **`nginx:1.25-alpine`**, **`gallery-public`**, **`9382:80`**
3. Add new paragraph to `index.html` on host; verify without rebuild

---

## Task 5 — Networking

1. Network **`gallery-net`**
2. **`ubuntu:22.04`**: **`gallery-storage`**, **`gallery-worker`** on `gallery-net`
3. Ping **`gallery-storage`** from worker

---

## Task 6 — Environment Variables

Container **`gallery-env`** (`ubuntu:22.04`):

- `APP_ENV=production`
- `STORAGE_HOST=gallery-storage`
- `MAX_UPLOAD_MB=50`

---

## Task 7 — Docker Compose (FE + Postgres + Redis)

**`task07-compose/docker-compose.yml`**:

| Service | Image | Port / volume |
|---------|-------|---------------|
| `web` | **`nginx:1.25-alpine`** | **`9383:80`** |
| `db` | **`postgres:15.5-alpine`** | `POSTGRES_PASSWORD=gallery123`, vol **`gallery-pg:/var/lib/postgresql/data`** |
| `cache` | **`redis:7.2-alpine`** | internal only |

Network: **`gallery-compose-net`**

---

## Task 8 — Troubleshooting

Reproduce `docker run --name gallery-uploader ubuntu:22.04` → fix as **`gallery-uploader-fixed`**

---

## Task 9 — Security

**`task09-security/Dockerfile`**: **`ubuntu:22.04`**, user **`galleryuser`**, build **`gallery-secure:v1`**

---

## Task 10 — Production Challenge

**`task10-prod/`** (*student-created*):

- `Dockerfile`: **`nginx:stable-alpine`**, **`galleryuser`**, HEALTHCHECK
- `docker-compose.yml`: **`9384:8080`**, env `APP_ENV=production`, `CDN_REGION=us-east`, volume **`gallery-cache:/cache`**, network **`gallery-prod-net`**
