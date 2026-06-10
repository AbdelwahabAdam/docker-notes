# Exam 4 Answers — Photo Gallery Service

---

## Task 1

```bash
docker run -d --name gallery-web -p 9380:80 --restart on-failure nginx:stable-alpine
docker ps
```

---

## Task 2

```dockerfile
FROM nginx
COPY welcome.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /srv/gallery
echo "<h1>Gallery</h1>" > /srv/gallery/welcome.html
cd /srv/gallery
docker build -t gallery-welcome:v1 .
docker run -d --name gallery-welcome -p 9381:80 gallery-welcome:v1
```

---

## Task 3

```bash
docker volume create gallery-meta
docker run -it --name gallery-store1 -v gallery-meta:/metadata ubuntu
echo '{"album":1}' > /metadata/album-001.json && exit
docker rm -f gallery-store1
docker run -it --name gallery-store2 -v gallery-meta:/metadata ubuntu
cat /metadata/album-001.json
```

---

## Task 4

```bash
mkdir -p /srv/gallery/public
echo "<img src='sample.jpg'>" > /srv/gallery/public/index.html
docker run -d --name gallery-public -p 9382:80 \
  -v /srv/gallery/public:/usr/share/nginx/html nginx
echo "<p>New photo</p>" >> /srv/gallery/public/index.html
```

---

## Task 5

```bash
docker network create gallery-net
docker run -dit --name gallery-storage --network gallery-net ubuntu
docker run -dit --name gallery-worker --network gallery-net ubuntu
docker exec gallery-worker ping -c 2 gallery-storage
```

---

## Task 6

```bash
docker run -dit --name gallery-env \
  -e APP_ENV=production \
  -e STORAGE_HOST=gallery-storage \
  -e MAX_UPLOAD_MB=50 \
  ubuntu
docker exec gallery-env printenv
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9383:80"
    networks:
      - gallery-compose-net
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: gallery123
    volumes:
      - gallery-pg:/var/lib/postgresql/data
    networks:
      - gallery-compose-net
  cache:
    image: redis:7-alpine
    networks:
      - gallery-compose-net
volumes:
  gallery-pg:
networks:
  gallery-compose-net:
```

---

## Task 8

```bash
docker logs gallery-uploader
docker rm -f gallery-uploader
docker run -dit --name gallery-uploader ubuntu
```

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd galleryuser
USER galleryuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t gallery-secure:v1 .
docker run -d --name gallery-secure gallery-secure:v1
docker exec gallery-secure id
```

---

## Task 10

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D galleryuser
USER galleryuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9384:8080"
    environment:
      APP_ENV: production
      CDN_REGION: us-east
    volumes:
      - gallery-cache:/cache
    networks:
      - gallery-prod-net
volumes:
  gallery-cache:
networks:
  gallery-prod-net:
```

```bash
docker compose up -d
docker ps && docker volume ls && docker network ls
```
