# Exam 1 Answers — Online Bookstore

> Run all commands from this directory (`exam-01-bookstore/`).

---

## Task 1 — Container Deployment

```bash
docker pull nginx:1.25-alpine
docker run -d \
  --name bookstore-web \
  -p 9080:80 \
  --restart unless-stopped \
  nginx:1.25-alpine

docker ps --filter name=bookstore-web
curl http://localhost:9080
```

---

## Task 2 — Image Creation

Create `task02-landing/Dockerfile`:

```dockerfile
FROM nginx:1.25-alpine
COPY index.html /usr/share/nginx/html/index.html
```

```bash
cd ./task02-landing
docker build -t bookstore-landing:v1 .
docker run -d --name bookstore-landing -p 9081:80 bookstore-landing:v1
curl http://localhost:9081
```

---

## Task 3 — Persistent Storage

```bash
docker volume create bookstore-data

docker run -it --name bookstore-storage1 \
  -v bookstore-data:/data \
  ubuntu:22.04
# inside: echo "title=Docker Deep Dive;qty=42" > /data/inventory.txt && exit

docker rm -f bookstore-storage1
docker run -it --name bookstore-storage2 \
  -v bookstore-data:/data \
  ubuntu:22.04
# inside: cat /data/inventory.txt
```

---

## Task 4 — Host Bind Mount

```bash
# Windows example — adjust drive/path:
docker run -d \
  --name bookstore-live \
  -p 9082:80 \
  -v G:/Devops_Hopa/Docker/./task04-live:/usr/share/nginx/html \
  nginx:1.25-alpine

# Edit task04-live/index.html on host, then:
curl http://localhost:9082
```

---

## Task 5 — Networking

```bash
docker network create bookstore-net

docker run -dit --name bookstore-db --network bookstore-net ubuntu:22.04
docker run -dit --name bookstore-api --network bookstore-net ubuntu:22.04

docker exec -it bookstore-api bash
apt update && apt install -y iputils-ping
ping -c 3 bookstore-db
```

---

## Task 6 — Environment Variables

```bash
docker run -dit \
  --name bookstore-env \
  -e APP_ENV=staging \
  -e DB_HOST=bookstore-db \
  -e DB_PORT=5432 \
  ubuntu:22.04

docker exec bookstore-env printenv APP_ENV DB_HOST DB_PORT
```

---

## Task 7 — Docker Compose

Create `task07-compose/docker-compose.yml`:

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "9083:80"
    networks:
      - bookstore-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: bookstore123
      POSTGRES_USER: bookstore
      POSTGRES_DB: books
    volumes:
      - bookstore-pg:/var/lib/postgresql/data
    networks:
      - bookstore-compose-net

volumes:
  bookstore-pg:

networks:
  bookstore-compose-net:
```

```bash
cd ./task07-compose
docker compose up -d
docker compose ps
```

---

## Task 8 — Troubleshooting

```bash
docker run --name bookstore-broken ubuntu:22.04
docker ps -a --filter name=bookstore-broken
docker logs bookstore-broken
docker inspect bookstore-broken

docker rm -f bookstore-broken
docker run -dit --name bookstore-broken-fixed ubuntu:22.04
docker ps --filter name=bookstore-broken-fixed
```

Root cause (`task08-troubleshooting/root-cause.txt`):

```text
Container exited because ubuntu:22.04 has no long-running foreground process when run without -dit or an explicit CMD like sleep infinity.
```

---

## Task 9 — Security

Create `task09-security/Dockerfile`:

```dockerfile
FROM ubuntu:22.04
RUN useradd -m bookuser
USER bookuser
CMD ["sleep", "infinity"]
```

```bash
cd ./task09-security
docker build -t bookstore-secure:v1 .
docker run -d --name bookstore-secure bookstore-secure:v1
docker exec bookstore-secure id
```

---

## Task 10 — Production Deployment Challenge

Create `task10-prod/Dockerfile`:

```dockerfile
FROM nginx:1.25-alpine
COPY fe/ /usr/share/nginx/html/
RUN adduser -D bookuser
USER bookuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

Create `.dockerignore`:

```
.env
docker-compose*
.git
```

Create `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9084:8080"
    environment:
      APP_ENV: production
    volumes:
      - bookstore-prod-data:/data
    networks:
      - bookstore-prod-net

volumes:
  bookstore-prod-data:

networks:
  bookstore-prod-net:
```

```bash
cd ./task10-prod
docker compose up -d --build
docker ps
docker volume ls | grep bookstore-prod
docker network ls | grep bookstore-prod
```
