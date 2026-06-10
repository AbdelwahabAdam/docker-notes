# Docker Practice Exam 5 — Inventory Management

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`mariadb:10.11`** |
| Container | **`inventory-db-temp`** |
| Env | `MARIADB_ROOT_PASSWORD=warehouse123` |
| Ports | **`9480:3306`** |
| Restart | **`unless-stopped`** |

---

## Task 2 — Image Creation (FE dashboard)

### Provided

- `task02-dashboard/dashboard.html`

### Required

1. **`task02-dashboard/Dockerfile`**, **`nginx:1.25-alpine`**
2. Build **`inventory-dash:v1`**, run **`inventory-dash`**, **`9481:80`**

---

## Task 3 — Persistent Storage

1. Volume **`inventory-stock`**
2. **`inv-store-a`** / **`inv-store-b`** (`ubuntu:22.04`), mount **`/stock`**
3. File **`/stock/count.txt`**: `items=500;warehouse=A`

---

## Task 4 — Host Bind Mount (CSV imports)

### Provided

- `task04-imports/items.csv`

### Required

1. **`ubuntu:22.04`**, **`inventory-import`**
2. Bind mount **`task04-imports/`** → **`/imports`**
3. Read CSV from inside container

---

## Task 5 — Networking

1. Network **`inventory-net`**
2. **`mariadb:10.11`** as **`inventory-mariadb`** (`MARIADB_ROOT_PASSWORD=pass`)
3. **`ubuntu:22.04`** as **`inventory-api`** on same network
4. Resolve **`inventory-mariadb`** hostname from API container

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.example`

Container **`inventory-sync`**:

- `APP_ENV=production`, `DB_HOST=inventory-mariadb`, `SYNC_INTERVAL=300`

---

## Task 7 — Docker Compose (FE + MariaDB + Adminer)

**`task07-compose/docker-compose.yml`**:

| Service | Image | Ports |
|---------|-------|-------|
| `web` | **`nginx:1.25-alpine`** | **`9483:80`** |
| `db` | **`mariadb:10.11`** | internal, vol **`inventory-db:/var/lib/mysql`**, password `inv123` |
| `adminer` | **`adminer:4`** | **`9485:8080`** |

Network **`inventory-compose-net`**

---

## Task 8 — Troubleshooting

`docker run --name inventory-cron ubuntu:22.04` → fix **`inventory-cron-fixed`**

---

## Task 9 — Security

User **`invuser`**, **`ubuntu:22.04`**, image **`inventory-secure:v1`**

---

## Task 10 — Production Challenge

**`task10-prod/`**:

- `Dockerfile`: **`nginx:1.25-alpine`**, **`invuser`**, HEALTHCHECK (`curl -f http://localhost`)
- Compose: **`9484:8080`**, volume **`inventory-reports:/reports`**, network **`inventory-prod-net`**, `APP_ENV=production`
