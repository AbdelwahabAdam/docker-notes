# Exam 6 Answers — Weather Dashboard

---

## Task 1

```bash
docker run -d --name weather-cache -p 9580:6379 --restart unless-stopped redis:alpine
docker ps
```

---

## Task 2

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

## Task 3

```bash
docker volume create weather-history
docker run -it --name weather-hist1 -v weather-history:/readings ubuntu
echo "sunny,22C" > /readings/2024-01-01.txt && exit
docker rm -f weather-hist1
docker run -it --name weather-hist2 -v weather-history:/readings ubuntu
cat /readings/2024-01-01.txt
```

---

## Task 4

```bash
mkdir -p /app/weather/templates
echo "Forecast" > /app/weather/templates/index.html
docker run -d --name weather-live -p 9582:80 \
  -v /app/weather/templates:/usr/share/nginx/html nginx
echo "Updated Forecast" > /app/weather/templates/index.html
```

---

## Task 5

```bash
docker network create weather-net
docker run -d --name weather-redis --network weather-net redis:alpine
docker run -dit --name weather-db --network weather-net ubuntu
docker run -dit --name weather-aggregator --network weather-net ubuntu
docker exec weather-aggregator bash -c "apt update && apt install -y iputils-ping && ping -c 1 weather-redis && ping -c 1 weather-db"
```

---

## Task 6

```bash
docker run -dit --name weather-fetcher \
  -e APP_ENV=staging \
  -e API_KEY=demo-key-123 \
  -e CACHE_HOST=weather-redis \
  ubuntu
docker exec weather-fetcher printenv
```

---

## Task 7

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

## Task 8

```bash
docker logs weather-collector
docker rm -f weather-collector
docker run -dit --name weather-collector ubuntu
```

**Root cause:** Container has no foreground process keeping it alive.

---

## Task 9

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

## Task 10

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
