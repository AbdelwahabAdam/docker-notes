# Exam 9 Answers — Online Learning Platform

---

## Task 1

```bash
docker run -d --name learn-web -p 9880:80 --restart unless-stopped nginx:alpine
docker ps
```

---

## Task 2

```dockerfile
FROM nginx
COPY home.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /edu/learn
echo "<h1>Learn Home</h1>" > /edu/learn/home.html
cd /edu/learn
docker build -t learn-home:v1 .
docker run -d --name learn-home -p 9881:80 learn-home:v1
```

---

## Task 3

```bash
docker volume create learn-progress
docker run -it --name learn-prog1 -v learn-progress:/progress ubuntu
echo '{"lesson":1}' > /progress/student-42.json && exit
docker rm -f learn-prog1
docker run -it --name learn-prog2 -v learn-progress:/progress ubuntu
cat /progress/student-42.json
```

---

## Task 4

```bash
mkdir -p /edu/learn/courses
echo "# Lesson 1" > /edu/learn/courses/lesson.md
docker run -dit --name learn-courses \
  -v /edu/learn/courses:/courses:ro ubuntu
docker exec learn-courses cat /courses/lesson.md
docker exec learn-courses bash -c "echo test >> /courses/lesson.md"  # should fail (ro)
```

---

## Task 5

```bash
docker network create learn-net
docker run -d --name learn-mongo --network learn-net \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=learn123 mongo
docker run -dit --name learn-api --network learn-net ubuntu
docker exec learn-api getent hosts learn-mongo
```

---

## Task 6

```bash
cat > .env.learn <<EOF
APP_ENV=development
DB_HOST=learn-mongo
EOF

docker run -dit --name learn-env \
  --env-file .env.learn \
  -e PORT=3000 \
  ubuntu
docker exec learn-env printenv | grep -E 'APP|DB|PORT'
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9883:80"
    depends_on:
      - backend
    networks:
      - learn-stack-net
  backend:
    image: node:20-alpine
    command: ["sleep", "infinity"]
    networks:
      - learn-stack-net
  mongo:
    image: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: learn123
    volumes:
      - learn-mongo:/data/db
    networks:
      - learn-stack-net
  redis:
    image: redis:alpine
    networks:
      - learn-stack-net
volumes:
  learn-mongo:
networks:
  learn-stack-net:
```

---

## Task 8

```bash
docker logs learn-worker
docker rm -f learn-worker
docker run -dit --name learn-worker ubuntu
```

**Root cause:** No foreground process; use `-dit` or explicit CMD like `sleep infinity`.

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd learnuser
USER learnuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t learn-secure:v1 .
docker run -d --name learn-secure learn-secure:v1
docker exec learn-secure id
```

---

## Task 10

Multi-stage Dockerfile:

```dockerfile
FROM node:20 AS base
WORKDIR /app

FROM base AS development
CMD ["sleep", "infinity"]

FROM nginx:alpine AS production
RUN adduser -D learnuser
USER learnuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

`docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      target: production
    restart: unless-stopped
    ports:
      - "9884:8080"
    environment:
      APP_ENV: production
    volumes:
      - learn-prod:/data
    networks:
      - learn-prod-net
volumes:
  learn-prod:
networks:
  learn-prod-net:
```

```bash
docker compose up -d --build
docker ps && docker volume ls && docker network ls
```
