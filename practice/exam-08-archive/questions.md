# Docker Practice Exam 8 — Document Archive

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25-alpine`** |
| Container | **`archive-web`** |
| Ports | **`9780:80`** |
| Restart | **`unless-stopped`** |

---

## Task 2 — Image Creation (FE portal)

### Provided

- `task02-portal/portal.html`

**`task02-portal/Dockerfile`**, build **`archive-portal:v1`**, port **`9781:80`**

---

## Task 3 — Persistent Storage

### Provided (reference)

- `task03-sample/doc-001.idx`

Volume **`archive-index`**, **`archive-idx1`** / **`archive-idx2`**, file **`/index/doc-001.idx`**

---

## Task 4 — Host Bind Mount (FE inbox)

### Provided

- `task04-inbox/index.html`

**`archive-inbox`**, **`9782:80`**, bind **`task04-inbox/`** → **`/usr/share/nginx/html`**

---

## Task 5 — Networking

**`archive-net`**: **`ubuntu:22.04`** → **`archive-search`**, **`archive-indexer`**, ping by hostname

---

## Task 6 — Environment Variables

**`archive-proc`**: `APP_ENV=production`, `SEARCH_HOST=archive-search`, `RETENTION_DAYS=365`

---

## Task 7 — Docker Compose

**`task07-compose/docker-compose.yml`**:

| Service | Image |
|---------|-------|
| `web` | **`nginx:1.25-alpine`** → **`9783:80`** |
| `db` | **`postgres:15-alpine`**, password `archive123`, vol **`archive-pg`** |
| `cache` | **`redis:7.2-alpine`** |

Network **`archive-compose-net`**

---

## Task 8 — Troubleshooting

**`archive-scanner`** → **`archive-scanner-fixed`**

---

## Task 9 — Security

User **`archiveuser`**, **`ubuntu:22.04`**, **`archive-secure:v1`**

---

## Task 10 — Production Challenge

**`task10-prod/`**: HEALTHCHECK, **`9784:8080`**, volume **`archive-data:/archive`**, network **`archive-prod-net`**, user **`archiveuser`**
