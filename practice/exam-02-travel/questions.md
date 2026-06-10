# Docker Practice Exam 2 — Travel Booking Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

### Scenario

Quick Apache landing page for a travel marketing campaign.

### Required

1. Image: **`httpd:2.4-alpine`**
2. Container name: **`travel-web`**
3. Port mapping: **`9180:80`**
4. Restart: **`unless-stopped`**, detached
5. Verify with `docker ps`

### Verify

```bash
curl http://localhost:9180
```

---

## Task 2 — Image Creation (FE)

### Provided

- `task02-promo/promo.html`

### Required

1. Create **`task02-promo/Dockerfile`**
2. Base: **`httpd:2.4-alpine`**
3. Copy `promo.html` → **`/usr/local/apache2/htdocs/index.html`**
4. Build: **`travel-promo:v2`**
5. Run **`travel-promo`**, port **`9181:80`**

### Verify

```bash
docker images travel-promo
curl http://localhost:9181
```

---

## Task 3 — Persistent Storage

### Required

1. Volume: **`travel-bookings`**
2. **`ubuntu:22.04`** → **`travel-rec1`**, mount at **`/records`**
3. Write **`/records/booking-001.txt`**: `flight=AA100;passenger=Smith`
4. Remove `travel-rec1`, start **`travel-rec2`** (same volume)
5. Verify file content

### Verify

```bash
docker exec travel-rec2 cat /records/booking-001.txt
```

---

## Task 4 — Host Bind Mount (FE)

### Provided

- `task04-marketing/index.html`

### Required

1. Bind mount **`task04-marketing/`** → nginx **`/usr/share/nginx/html`**
2. Image: **`nginx:1.25-alpine`**, container **`travel-marketing`**, port **`9182:80`**
3. Edit `index.html` on host; confirm live update

---

## Task 5 — Networking

### Required

1. Network: **`travel-net`**
2. **`ubuntu:22.04`**: **`travel-payment`**, **`travel-api`** on `travel-net` (`-dit`)
3. Ping **`travel-payment`** from **`travel-api`** by hostname

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.example`

### Required

1. Container **`travel-envtest`** from **`ubuntu:22.04`**
2. Variables:
   - `APP_ENV=production`
   - `PAYMENT_HOST=travel-payment`
   - `CURRENCY=USD`
3. Verify with `docker exec travel-envtest printenv`

---

## Task 7 — Docker Compose (FE + DB)

### Required

Create **`task07-compose/docker-compose.yml`**:

| Service | Image | Config |
|---------|-------|--------|
| `web` | **`nginx:1.25-alpine`** | Ports **`9183:80`**, network `travel-compose-net` |
| `db` | **`mysql:8.0`** | `MYSQL_ROOT_PASSWORD=TravelPass123`, volume **`travel-mysql:/var/lib/mysql`** |

Declare volume `travel-mysql` and network `travel-compose-net`.

### Verify

```bash
docker compose -f task07-compose/docker-compose.yml up -d
docker compose -f task07-compose/docker-compose.yml ps
```

---

## Task 8 — Troubleshooting

### Required

1. Reproduce: `docker run --name travel-crash ubuntu:22.04`
2. Diagnose with logs/inspect
3. Fix: run **`travel-crash-fixed`** (`ubuntu:22.04`, `-dit`) that stays up
4. Document root cause in **`task08-troubleshooting/root-cause.txt`**

---

## Task 9 — Security

### Required

1. **`task09-security/Dockerfile`**, base **`ubuntu:22.04`**
2. User **`traveluser`**, `USER traveluser`, CMD `sleep infinity`
3. Build **`travel-secure:v1`**, run **`travel-secure`**
4. Verify non-root UID

---

## Task 10 — Production Challenge (FE + Compose)

### Provided

- `task10-prod/fe/index.html`

### Required — create in `task10-prod/`

| File | Spec |
|------|------|
| `Dockerfile` | **`nginx:1.25-alpine`**, user **`traveluser`**, HEALTHCHECK, copy `fe/` |
| `.dockerignore` | Exclude `.env`, compose files |
| `docker-compose.yml` | Port **`9184:8080`**, env `APP_ENV=production`, `REGION=eu-west`, volume **`travel-cache:/var/cache/travel`**, network **`travel-prod-net`**, restart **`unless-stopped`** |

### Verify

```bash
docker compose -f task10-prod/docker-compose.yml up -d --build
docker ps && curl http://localhost:9184
```
