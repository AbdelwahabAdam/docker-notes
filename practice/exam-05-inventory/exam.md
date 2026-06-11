# Docker Practice Exam 5 — Inventory Management

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`mariadb:10.11`** |
| Container | **`inventory-db-temp`** |
| Env | `MARIADB_ROOT_PASSWORD=warehouse123` |
| Ports | **`9480:3306`** |
| Restart | **`unless-stopped`** |


### Answer

```bash
docker run -d \
  --name inventory-db-temp \
  -e MARIADB_ROOT_PASSWORD=warehouse123 \
  -p 9480:3306 \
  --restart unless-stopped \
  mariadb:10
docker ps
```

---

## Task 2 — Image Creation (FE dashboard)

### Provided

- `dashboard.html`

### Required

1. **`Dockerfile.landing`**, **`nginx:1.25-alpine`**
2. Build **`inventory-dash:v1`**, run **`inventory-dash`**, **`9481:80`**


### Answer

```dockerfile
FROM nginx
COPY dashboard.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /opt/inventory
echo "<h1>Inventory Dashboard</h1>" > /opt/inventory/dashboard.html
cd /opt/inventory
docker build -t inventory-dash:v1 .
docker run -d --name inventory-dash -p 9481:80 inventory-dash:v1
```

---

## Task 3 — Persistent Storage

1. Volume **`inventory-stock`**
2. **`inv-store-a`** / **`inv-store-b`** (`ubuntu:22.04`), mount **`/stock`**
3. File **`/stock/count.txt`**: `items=500;warehouse=A`


### Answer

```bash
docker volume create inventory-stock
docker run -it --name inv-store-a -v inventory-stock:/stock ubuntu
echo "items=500" > /stock/count.txt && exit
docker rm -f inv-store-a
docker run -it --name inv-store-b -v inventory-stock:/stock ubuntu
cat /stock/count.txt
```

---

## Task 4 — Host Bind Mount (CSV imports)

### Provided

- `items.csv`

### Required

1. **`ubuntu:22.04`**, **`inventory-import`**
2. Bind mount **`./`** → **`/imports`**
3. Read CSV from inside container


### Answer

```bash
mkdir -p /opt/inventory/imports
echo "sku,name\n1,widget" > /opt/inventory/imports/items.csv
docker run -dit --name inventory-import \
  -v /opt/inventory/imports:/imports ubuntu
docker exec inventory-import cat /imports/items.csv
```

---

## Task 5 — Networking

1. Network **`inventory-net`**
2. **`mariadb:10.11`** as **`inventory-mariadb`** (`MARIADB_ROOT_PASSWORD=pass`)
3. **`ubuntu:22.04`** as **`inventory-api`** on same network
4. Resolve **`inventory-mariadb`** hostname from API container


### Answer

```bash
docker network create inventory-net
docker run -d --name inventory-mariadb --network inventory-net \
  -e MARIADB_ROOT_PASSWORD=pass mariadb:10
docker run -dit --name inventory-api --network inventory-net ubuntu
docker exec inventory-api getent hosts inventory-mariadb
```

---

## Task 6 — Environment Variables

### Provided

- `env.example`

Container **`inventory-sync`**:

- `APP_ENV=production`, `DB_HOST=inventory-mariadb`, `SYNC_INTERVAL=300`


### Answer

```bash
docker run -dit --name inventory-sync \
  -e APP_ENV=production \
  -e DB_HOST=inventory-mariadb \
  -e SYNC_INTERVAL=300 \
  ubuntu
docker exec inventory-sync printenv
```

---

## Task 7 — Docker Compose (FE + MariaDB + Adminer)

**`docker-compose.staging.yml`**:

| Service | Image | Ports |
|---------|-------|-------|
| `web` | **`nginx:1.25-alpine`** | **`9483:80`** |
| `db` | **`mariadb:10.11`** | internal, vol **`inventory-db:/var/lib/mysql`**, password `inv123` |
| `adminer` | **`adminer:4`** | **`9485:8080`** |

Network **`inventory-compose-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9483:80"
    networks:
      - inventory-compose-net
  db:
    image: mariadb:10
    environment:
      MARIADB_ROOT_PASSWORD: inv123
    volumes:
      - inventory-db:/var/lib/mysql
    networks:
      - inventory-compose-net
  adminer:
    image: adminer
    ports:
      - "9485:8080"
    networks:
      - inventory-compose-net
volumes:
  inventory-db:
networks:
  inventory-compose-net:
```

---

## Task 8 — Troubleshooting

`docker run --name inventory-cron ubuntu:22.04` → fix **`inventory-cron-fixed`**


### Answer

```bash
docker logs inventory-cron
docker rm -f inventory-cron
docker run -dit --name inventory-cron ubuntu
```

**Root cause:** No long-running process in foreground.

---

## Task 9 — Security

User **`invuser`**, **`ubuntu:22.04`**, image **`inventory-secure:v1`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd invuser
USER invuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t inventory-secure:v1 .
docker run -d --name inventory-secure inventory-secure:v1
docker exec inventory-secure id
```

---

## Task 10 — Production Challenge

****exam root****:

- `Dockerfile`: **`nginx:1.25-alpine`**, **`invuser`**, HEALTHCHECK (`curl -f http://localhost`)
- Compose: **`9484:8080`**, volume **`inventory-reports:/reports`**, network **`inventory-prod-net`**, `APP_ENV=production`

### Answer

```dockerfile
FROM nginx
RUN useradd invuser
USER invuser
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9484:8080"
    environment:
      APP_ENV: production
    volumes:
      - inventory-reports:/reports
    networks:
      - inventory-prod-net
volumes:
  inventory-reports:
networks:
  inventory-prod-net:
```

---
