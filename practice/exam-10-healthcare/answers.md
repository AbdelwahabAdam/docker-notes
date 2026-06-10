# Exam 10 Answers — Healthcare Patient Portal

> Run from `exam-10-healthcare/`

---

## Task 1

```bash
docker run -d \
  --name health-portal-web \
  -p 9980:80 \
  --restart unless-stopped \
  nginx:stable-alpine

docker ps
docker inspect health-portal-web
```

---

## Task 2

```dockerfile
FROM nginx
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
cd ./task02-welcome
docker build -t health-welcome:v1 .
docker tag health-welcome:v1 health-welcome:latest
docker run -d --name health-welcome -p 9981:80 health-welcome:v1
docker images | grep health-welcome
```

---

## Task 3

```bash
docker volume create health-audit
docker run -it --name health-audit1 -v health-audit:/audit ubuntu
echo "user login 10:00" > /audit/access.log && exit
docker rm -f health-audit1
docker run -it --name health-audit2 -v health-audit:/audit ubuntu
cat /audit/access.log
```

---

## Task 4

```bash
docker run -d --name health-docs -p 9982:80 \
  -v $(pwd)/task04-docs:/usr/share/nginx/html:ro \
  nginx:1.25-alpine
docker exec health-docs cat /usr/share/nginx/html/policy.html
```

---

## Task 5

```bash
docker network create health-net
docker run -d --name health-db --network health-net \
  -e POSTGRES_PASSWORD=health123 postgres:15-alpine
docker run -dit --name health-api --network health-net ubuntu
docker exec health-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 health-db"
```

---

## Task 6

```bash
cat > health.env <<EOF
AUDIT_ENABLED=true
EOF

docker run -dit --name health-app-env \
  --env-file health.env \
  -e APP_ENV=production \
  -e DB_HOST=health-db \
  -e DB_PORT=5432 \
  ubuntu

docker exec health-app-env printenv | grep -E 'APP|DB|AUDIT'
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9983:80"
    depends_on:
      - db
      - cache
    networks:
      - health-compose-net

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: health123
    volumes:
      - health-pg:/var/lib/postgresql/data
    networks:
      - health-compose-net

  cache:
    image: redis
    restart: always
    networks:
      - health-compose-net

volumes:
  health-pg:

networks:
  health-compose-net:
```

```bash
docker compose up -d
docker compose ps
```

---

## Task 8

```bash
docker ps -a | grep health-sync
docker logs health-sync
docker inspect health-sync --format='{{.State.ExitCode}}'

docker rm -f health-sync
docker run -dit --name health-sync ubuntu
docker ps
```

**Root cause:** Container started without a persistent foreground process (e.g. `docker run ubuntu` exits immediately).

---

## Task 9

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
CMD ["nginx", "-g", "daemon off;"]
```

Note: nginx normally needs root to bind port 80; for exam purposes use sleep pattern if nginx fails:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t health-secure:v1 .
docker run -d --name health-secure health-secure:v1
docker exec health-secure id
```

---

## Task 10 — Production Deployment Challenge

`.dockerignore`:

```
.env
docker-compose*
.git
```

Dockerfile:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D healthuser
USER healthuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

`docker-compose.yml`:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9984:8080"
    environment:
      APP_ENV: production
      COMPLIANCE_MODE: strict
    volumes:
      - health-prod-data:/data
    networks:
      - health-prod-net

volumes:
  health-prod-data:

networks:
  health-prod-net:
```

Deploy and verify:

```bash
docker compose up -d --build
docker ps
docker volume ls
docker network ls
docker inspect $(docker compose ps -q)
docker inspect --format='{{.State.Health.Status}}' $(docker compose ps -q)
```

---

## Bonus — Multi-Environment Compose

`docker-compose.yml` (base):

```yaml
services:
  app:
    build: .
    networks:
      - health-net
    volumes:
      - health-data:/data
volumes:
  health-data:
networks:
  health-net:
```

`docker-compose.prod.yml`:

```yaml
services:
  app:
    restart: unless-stopped
    ports:
      - "9984:8080"
    environment:
      APP_ENV: production
```

`docker-compose.dev.yml`:

```yaml
services:
  app:
    volumes:
      - ./src:/app/src:ro
    environment:
      APP_ENV: development
```

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
