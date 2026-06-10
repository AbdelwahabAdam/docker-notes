# Exam 3 Answers — Fitness Tracker API

> Run from `exam-03-fitness/`

---

## Task 1

```bash
docker run -d --name fitness-redis -p 9280:6379 --restart always redis:7-alpine
docker ps
```

---

## Task 2

```dockerfile
FROM nginx:alpine
COPY health.html /usr/share/nginx/html/index.html
```

```bash
cd ./task02-health
docker build -t fitness-health:v1 .
docker run -d --name fitness-health -p 9281:80 fitness-health:v1
```

---

## Task 3

```bash
docker volume create fitness-logs
docker run -it --name fitness-log1 -v fitness-logs:/logs ubuntu
echo "5km run" > /logs/workout-day1.txt && exit
docker rm -f fitness-log1
docker run -it --name fitness-log2 -v fitness-logs:/logs ubuntu
cat /logs/workout-day1.txt
```

---

## Task 4

```bash
mkdir -p /home/fitness/config
echo '{"debug":true}' > /home/fitness/config/settings.json
docker run -dit --name fitness-config \
  -v /home/fitness/config:/app/config:ro ubuntu
docker exec fitness-config cat /app/config/settings.json
```

---

## Task 5

```bash
docker network create fitness-net
docker run -d --name fitness-cache --network fitness-net redis:7-alpine
docker run -dit --name fitness-api --network fitness-net ubuntu
docker exec fitness-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 fitness-cache"
```

---

## Task 6

```bash
docker run -dit --name fitness-env \
  -e APP_ENV=development \
  -e REDIS_HOST=fitness-cache \
  -e LOG_LEVEL=debug \
  ubuntu
docker exec fitness-env printenv | grep -E 'APP|REDIS|LOG'
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9283:80"
    networks:
      - fitness-stack-net
  redis:
    image: redis:7-alpine
    networks:
      - fitness-stack-net
  mongo:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: fitness123
    volumes:
      - fitness-mongo:/data/db
    networks:
      - fitness-stack-net
volumes:
  fitness-mongo:
networks:
  fitness-stack-net:
```

---

## Task 8

```bash
docker logs fitness-worker
docker rm -f fitness-worker
docker run -dit --name fitness-worker ubuntu
```

**Root cause:** `docker run ubuntu` exits when default command completes.

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd fitnessapp
USER fitnessapp
CMD ["sleep", "infinity"]
```

```bash
docker build -t fitness-secure:v1 .
docker run -d --name fitness-secure fitness-secure:v1
docker exec fitness-secure id
```

---

## Task 10

```dockerfile
FROM nginx:alpine
RUN adduser -D fitnessapp
USER fitnessapp
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9284:8080"
    environment:
      APP_ENV: production
      METRICS_ENABLED: "true"
    volumes:
      - fitness-metrics-data:/data
    networks:
      - fitness-prod-net
volumes:
  fitness-metrics-data:
networks:
  fitness-prod-net:
```
