# Docker Practice Exam 6 — Weather Dashboard

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`redis:7.2-alpine`** |
| Container | **`weather-cache`** |
| Ports | **`9580:6379`** |
| Restart | **`unless-stopped`** |


### Answer

```bash
docker run -d --name weather-cache -p 9580:6379 --restart unless-stopped redis:alpine
docker ps
```

---

## Task 2 — Image Creation (FE widget)

### Provided

- `widget.html`

### Required

**`Dockerfile.landing`**, **`nginx:1.25-alpine`**, build **`weather-widget:v1`**, port **`9581:80`**


### Answer

```dockerfile
FROM nginx
COPY widget.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /app/weather
echo "<div>Weather Widget</div>" > /app/weather/widget.html
cd /app/weather
docker build -t weather-widget:v1 .
docker run -d --name weather-widget -p 9581:80 weather-widget:v1
```

---

## Task 3 — Persistent Storage

Volume **`weather-history`**, containers **`weather-hist1`** / **`weather-hist2`**, file **`/readings/2024-01-01.txt`**: `sunny,22C,humidity=45`


### Answer

```bash
docker volume create weather-history
docker run -it --name weather-hist1 -v weather-history:/readings ubuntu
echo "sunny,22C" > /readings/2024-01-01.txt && exit
docker rm -f weather-hist1
docker run -it --name weather-hist2 -v weather-history:/readings ubuntu
cat /readings/2024-01-01.txt
```

---

## Task 4 — Host Bind Mount (FE templates)

### Provided

- `forecast-index.html`

Bind **`./`** → nginx web root, **`weather-live`**, **`9582:80`**, **`nginx:1.25-alpine`**


### Answer

```bash
mkdir -p /app/weather/templates
echo "Forecast" > /app/weather/templates/index.html
docker run -d --name weather-live -p 9582:80 \
  -v /app/weather/templates:/usr/share/nginx/html nginx
echo "Updated Forecast" > /app/weather/templates/index.html
```

---

## Task 5 — Networking

Network **`weather-net`**:

- **`redis:7.2-alpine`** → **`weather-redis`**
- **`ubuntu:22.04`** → **`weather-db`**, **`weather-aggregator`**
- Aggregator pings **`weather-redis`** and **`weather-db`** by name


### Answer

```bash
docker network create weather-net
docker run -d --name weather-redis --network weather-net redis:alpine
docker run -dit --name weather-db --network weather-net ubuntu
docker run -dit --name weather-aggregator --network weather-net ubuntu
docker exec weather-aggregator bash -c "apt update && apt install -y iputils-ping && ping -c 1 weather-redis && ping -c 1 weather-db"
```

---

## Task 6 — Environment Variables

### Provided

- `env.example`

**`weather-fetcher`**: `APP_ENV=staging`, `API_KEY=demo-key-123`, `CACHE_HOST=weather-redis`


### Answer

```bash
docker run -dit --name weather-fetcher \
  -e APP_ENV=staging \
  -e API_KEY=demo-key-123 \
  -e CACHE_HOST=weather-redis \
  ubuntu
docker exec weather-fetcher printenv
```

---

## Task 7 — Docker Compose

**`docker-compose.staging.yml`**:

| Service | Image |
|---------|-------|
| `web` | **`nginx:1.25-alpine`** → **`9583:80`** |
| `cache` | **`redis:7.2-alpine`** |
| `db` | **`postgres:15-alpine`**, password `weather123`, vol **`weather-pg`** |

Network **`weather-stack-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9583:80"
    networks:
      - weather-stack-net
  cache:
    image: redis:alpine
    networks:
      - weather-stack-net
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: weather123
    volumes:
      - weather-pg:/var/lib/postgresql/data
    networks:
      - weather-stack-net
volumes:
  weather-pg:
networks:
  weather-stack-net:
```

---

## Task 8 — Troubleshooting

**`weather-collector`** exits → fix **`weather-collector-fixed`** (`ubuntu:22.04`, `-dit`)


### Answer

```bash
docker logs weather-collector
docker rm -f weather-collector
docker run -dit --name weather-collector ubuntu
```

**Root cause:** Container has no foreground process keeping it alive.

---

## Task 9 — Security

User **`weatherapp`**, **`ubuntu:22.04`**, **`weather-secure:v1`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd weatherapp
USER weatherapp
CMD ["sleep", "infinity"]
```

```bash
docker build -t weather-secure:v1 .
docker run -d --name weather-secure weather-secure:v1
docker exec weather-secure id
```

---

## Task 10 — Production Challenge

****exam root****: **`nginx:1.25-alpine`**, HEALTHCHECK, port **`9584:8080`**, volume **`weather-data:/data`**, network **`weather-prod-net`**

### Answer

```dockerfile
FROM nginx
RUN useradd weatherapp
USER weatherapp
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9584:8080"
    environment:
      APP_ENV: production
    volumes:
      - weather-data:/data
    networks:
      - weather-prod-net
volumes:
  weather-data:
networks:
  weather-prod-net:
```

```bash
docker compose up -d
docker ps && docker volume ls && docker network ls
```

---
