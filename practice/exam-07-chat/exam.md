# Docker Practice Exam 7 — Chat Messaging App

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

**Format:** Try each task first — the **Answer** is directly below it.

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25-alpine`** |
| Container | **`chat-gateway`** |
| Ports | **`9680:80`** |
| Restart | **`unless-stopped`** |


### Answer

```bash
docker run -d --name chat-gateway -p 9680:80 --restart unless-stopped nginx
docker ps
```

---

## Task 2 — Image Creation (FE login)

### Provided

- `login.html`

**`Dockerfile.landing`**, build **`chat-login:v1`**, port **`9681:80`**


### Answer

```dockerfile
FROM nginx
COPY login.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /srv/chat
echo "<h1>Chat Login</h1>" > /srv/chat/login.html
cd /srv/chat
docker build -t chat-login:v1 .
docker run -d --name chat-login -p 9681:80 chat-login:v1
```

---

## Task 3 — Persistent Storage

Volume **`chat-messages`**, **`chat-archive1`** / **`chat-archive2`**, log **`/messages/room-1.log`**: `user1: hello`


### Answer

```bash
docker volume create chat-messages
docker run -it --name chat-archive1 -v chat-messages:/messages ubuntu
echo "hello room" > /messages/room-1.log && exit
docker rm -f chat-archive1
docker run -it --name chat-archive2 -v chat-messages:/messages ubuntu
cat /messages/room-1.log
```

---

## Task 4 — Host Bind Mount (FE assets)

### Provided

- `chat-assets-index.html`

**`chat-assets`**, **`nginx:1.25-alpine`**, **`9682:80`**, bind **`./`** → web root


### Answer

```bash
mkdir -p /srv/chat/assets
echo "<h1>Chat UI</h1>" > /srv/chat/assets/index.html
docker run -d --name chat-assets -p 9682:80 \
  -v /srv/chat/assets:/usr/share/nginx/html nginx
echo "<script>app.js</script>" >> /srv/chat/assets/index.html
```

---

## Task 5 — Networking

**`chat-net`**: **`redis:7.2-alpine`** (`chat-redis`) + **`ubuntu:22.04`** (`chat-api`), DNS resolve **`chat-redis`**


### Answer

```bash
docker network create chat-net
docker run -d --name chat-redis --network chat-net redis
docker run -dit --name chat-api --network chat-net ubuntu
docker exec chat-api getent hosts chat-redis
```

---

## Task 6 — Environment Variables

### Provided

- `env.example`

**`chat-server-env`**: `APP_ENV=production`, `REDIS_URL=redis://chat-redis:6379`, `MAX_MESSAGE_LEN=4096`


### Answer

```bash
docker run -dit --name chat-server-env \
  -e APP_ENV=production \
  -e REDIS_URL=redis://chat-redis:6379 \
  -e MAX_MESSAGE_LEN=4096 \
  ubuntu
docker exec chat-server-env printenv
```

---

## Task 7 — Docker Compose (FE + Redis + Mongo)

**`docker-compose.staging.yml`**:

| Service | Image | Config |
|---------|-------|--------|
| `web` | **`nginx:1.25-alpine`** | **`9683:80`** |
| `redis` | **`redis:7.2-alpine`** | |
| `mongo` | **`mongo:7.0`** | user `chatadmin`, pass `chatpass`, vol **`chat-mongo`** |

Network **`chat-compose-net`**


### Answer

```yaml
services:
  web:
    image: nginx
    ports:
      - "9683:80"
    networks:
      - chat-compose-net
  redis:
    image: redis
    networks:
      - chat-compose-net
  mongo:
    image: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: chatadmin
      MONGO_INITDB_ROOT_PASSWORD: chatpass
    volumes:
      - chat-mongo:/data/db
    networks:
      - chat-compose-net
volumes:
  chat-mongo:
networks:
  chat-compose-net:
```

---

## Task 8 — Troubleshooting

**`chat-bot`** broken → **`chat-bot-fixed`**


### Answer

```bash
docker logs chat-bot
docker inspect chat-bot
docker rm -f chat-bot
docker run -dit --name chat-bot ubuntu
```

---

## Task 9 — Security

User **`chatuser`**, **`ubuntu:22.04`**, **`chat-secure:v1`**


### Answer

```dockerfile
FROM ubuntu
RUN useradd chatuser
USER chatuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t chat-secure:v1 .
docker run -d --name chat-secure chat-secure:v1
docker exec chat-secure id
```

---

## Task 10 — Production Challenge

****exam root****: **`nginx:stable-alpine`**, **`chatuser`**, HEALTHCHECK, **`9684:8080`**, vol **`chat-prod-data:/data`**, network **`chat-prod-net`**

### Answer

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D chatuser
USER chatuser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9684:8080"
    environment:
      APP_ENV: production
    volumes:
      - chat-prod-data:/data
    networks:
      - chat-prod-net
volumes:
  chat-prod-data:
networks:
  chat-prod-net:
```

---
