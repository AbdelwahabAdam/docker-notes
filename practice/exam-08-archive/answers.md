# Exam 8 Answers — Document Archive

---

## Task 1

```bash
docker run -d --name archive-web -p 9780:80 --restart unless-stopped nginx
docker ps
```

---

## Task 2

```dockerfile
FROM nginx
COPY portal.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /data/archive
echo "<h1>Archive Portal</h1>" > /data/archive/portal.html
cd /data/archive
docker build -t archive-portal:v1 .
docker run -d --name archive-portal -p 9781:80 archive-portal:v1
```

---

## Task 3

```bash
docker volume create archive-index
docker run -it --name archive-idx1 -v archive-index:/index ubuntu
echo "doc metadata" > /index/doc-001.idx && exit
docker rm -f archive-idx1
docker run -it --name archive-idx2 -v archive-index:/index ubuntu
cat /index/doc-001.idx
```

---

## Task 4

```bash
mkdir -p /data/archive/inbox
echo "<h1>Inbox</h1>" > /data/archive/inbox/index.html
docker run -d --name archive-inbox -p 9782:80 \
  -v /data/archive/inbox:/usr/share/nginx/html nginx
echo "<p>New doc</p>" >> /data/archive/inbox/index.html
```

---

## Task 5

```bash
docker network create archive-net
docker run -dit --name archive-search --network archive-net ubuntu
docker run -dit --name archive-indexer --network archive-net ubuntu
docker exec archive-indexer ping -c 2 archive-search
```

---

## Task 6

```bash
docker run -dit --name archive-proc \
  -e APP_ENV=production \
  -e SEARCH_HOST=archive-search \
  -e RETENTION_DAYS=365 \
  ubuntu
docker exec archive-proc printenv
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9783:80"
    networks:
      - archive-compose-net
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: archive123
    volumes:
      - archive-pg:/var/lib/postgresql/data
    networks:
      - archive-compose-net
  cache:
    image: redis
    networks:
      - archive-compose-net
volumes:
  archive-pg:
networks:
  archive-compose-net:
```

---

## Task 8

```bash
docker logs archive-scanner
docker rm -f archive-scanner
docker run -dit --name archive-scanner ubuntu
```

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd archiveuser
USER archiveuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t archive-secure:v1 .
docker run -d --name archive-secure archive-secure:v1
docker exec archive-secure id
```

---

## Task 10

```dockerfile
FROM nginx
RUN useradd archiveuser
USER archiveuser
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9784:8080"
    environment:
      APP_ENV: production
    volumes:
      - archive-data:/archive
    networks:
      - archive-prod-net
volumes:
  archive-data:
networks:
  archive-prod-net:
```

```bash
docker compose up -d
docker inspect $(docker compose ps -q)
```
