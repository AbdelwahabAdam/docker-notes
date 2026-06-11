# Docker Practice Exam 2 — Travel Booking Portal

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

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


### Answer

```bash
docker run -d --name travel-web -p 9180:80 --restart unless-stopped httpd:alpine
docker ps
```

---

## Task 2 — Image Creation (FE)

### Provided

- `promo.html`

### Required

1. Create **`Dockerfile.landing`**
2. Base: **`httpd:2.4-alpine`**
3. Copy `promo.html` → **`/usr/local/apache2/htdocs/index.html`**
4. Build: **`travel-promo:v2`**
5. Run **`travel-promo`**, port **`9181:80`**

### Verify

```bash
docker images travel-promo
curl http://localhost:9181
```


### Answer

```dockerfile
FROM httpd:alpine
COPY promo.html /usr/local/apache2/htdocs/index.html
```

```bash
docker build -f Dockerfile.landing
# uses provided promo.html
docker build -t travel-promo:v2 .
docker run -d --name travel-promo -p 9181:80 travel-promo:v2
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


### Answer

```bash
docker volume create travel-bookings
docker run -it --name travel-rec1 -v travel-bookings:/records ubuntu
echo "flight=AA100" > /records/booking-001.txt
exit
docker rm -f travel-rec1
docker run -it --name travel-rec2 -v travel-bookings:/records ubuntu
cat /records/booking-001.txt
```

---

## Task 4 — Host Bind Mount (FE)

### Provided

- `marketing-index.html`

### Required

1. Bind mount **`./`** → nginx **`/usr/share/nginx/html`**
2. Image: **`nginx:1.25-alpine`**, container **`travel-marketing`**, port **`9182:80`**
3. Edit `index.html` on host; confirm live update


### Answer

```bash
docker run -d --name travel-marketing -p 9182:80 \
  -v G:/Devops_Hopa/Docker/practice/exam-02-travel:/usr/share/nginx/html \
  nginx:1.25-alpine
# edit marketing-index.html on host
```

---

## Task 5 — Networking

### Required

1. Network: **`travel-net`**
2. **`ubuntu:22.04`**: **`travel-payment`**, **`travel-api`** on `travel-net` (`-dit`)
3. Ping **`travel-payment`** from **`travel-api`** by hostname


### Answer

```bash
docker network create travel-net
docker run -dit --name travel-payment --network travel-net ubuntu
docker run -dit --name travel-api --network travel-net ubuntu
docker exec -it travel-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 travel-payment"
```

---

## Task 6 — Environment Variables

### Provided

- `env.example`

### Required

1. Container **`travel-envtest`** from **`ubuntu:22.04`**
2. Variables:
   - `APP_ENV=production`
   - `PAYMENT_HOST=travel-payment`
   - `CURRENCY=USD`
3. Verify with `docker exec travel-envtest printenv`


### Answer

```bash
docker run -dit --name travel-envtest \
  -e APP_ENV=production \
  -e PAYMENT_HOST=travel-payment \
  -e CURRENCY=USD \
  ubuntu
docker exec travel-envtest printenv
```

---

## Task 7 — Docker Compose (FE + DB)

### Required

Create **`docker-compose.staging.yml`**:

| Service | Image | Config |
|---------|-------|--------|
| `web` | **`nginx:1.25-alpine`** | Ports **`9183:80`**, network `travel-compose-net` |
| `db` | **`mysql:8.0`** | `MYSQL_ROOT_PASSWORD=TravelPass123`, volume **`travel-mysql:/var/lib/mysql`** |

Declare volume `travel-mysql` and network `travel-compose-net`.

### Verify

```bash
docker compose -f docker-compose.staging.yml up -d
docker compose -f docker-compose.staging.yml ps
```


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9183:80"
    networks:
      - travel-compose-net
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: TravelPass123
    volumes:
      - travel-mysql:/var/lib/mysql
    networks:
      - travel-compose-net
volumes:
  travel-mysql:
networks:
  travel-compose-net:
```

```bash
docker compose up -d && docker compose ps
```

---

## Task 8 — Troubleshooting

### Required

1. Reproduce: `docker run --name travel-crash ubuntu:22.04`
2. Diagnose with logs/inspect
3. Fix: run **`travel-crash-fixed`** (`ubuntu:22.04`, `-dit`) that stays up
4. Document root cause in **`root-cause.txt`**


### Answer

```bash
docker logs travel-crash
# No foreground process — container exits
docker rm -f travel-crash
docker run -dit --name travel-crash ubuntu
```

**Root cause:** Started without `-d -i -t` and no persistent CMD.

---

## Task 9 — Security

### Required

1. **`Dockerfile.secure`**, base **`ubuntu:22.04`**
2. User **`traveluser`**, `USER traveluser`, CMD `sleep infinity`
3. Build **`travel-secure:v1`**, run **`travel-secure`**
4. Verify non-root UID


### Answer

```dockerfile
FROM ubuntu
RUN useradd traveluser
USER traveluser
CMD ["sleep", "infinity"]
```

```bash
docker build -t travel-secure:v1 .
docker run -d --name travel-secure travel-secure:v1
docker exec travel-secure id
```

---

## Task 10 — Production Challenge (FE + Compose)

### Provided

- `prod-index.html`

### Required — create in **exam root**

| File | Spec |
|------|------|
| `Dockerfile` | **`nginx:1.25-alpine`**, user **`traveluser`**, HEALTHCHECK, copy `fe/` |
| `.dockerignore` | Exclude `.env`, compose files |
| `docker-compose.yml` | Port **`9184:8080`**, env `APP_ENV=production`, `REGION=eu-west`, volume **`travel-cache:/var/cache/travel`**, network **`travel-prod-net`**, restart **`unless-stopped`** |

### Verify

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker ps && curl http://localhost:9184
```

### Answer

Dockerfile:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D traveluser
USER traveluser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9184:8080"
    environment:
      APP_ENV: production
      REGION: eu-west
    volumes:
      - travel-cache:/var/cache/travel
    networks:
      - travel-prod-net
volumes:
  travel-cache:
networks:
  travel-prod-net:
```

```bash
docker compose up -d
docker ps
```

---
