# Docker Practice Exam 7 — Chat Messaging App

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25-alpine`** |
| Container | **`chat-gateway`** |
| Ports | **`9680:80`** |
| Restart | **`unless-stopped`** |

---

## Task 2 — Image Creation (FE login)

### Provided

- `task02-login/login.html`

**`task02-login/Dockerfile`**, build **`chat-login:v1`**, port **`9681:80`**

---

## Task 3 — Persistent Storage

Volume **`chat-messages`**, **`chat-archive1`** / **`chat-archive2`**, log **`/messages/room-1.log`**: `user1: hello`

---

## Task 4 — Host Bind Mount (FE assets)

### Provided

- `task04-assets/index.html`

**`chat-assets`**, **`nginx:1.25-alpine`**, **`9682:80`**, bind **`task04-assets/`** → web root

---

## Task 5 — Networking

**`chat-net`**: **`redis:7.2-alpine`** (`chat-redis`) + **`ubuntu:22.04`** (`chat-api`), DNS resolve **`chat-redis`**

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.example`

**`chat-server-env`**: `APP_ENV=production`, `REDIS_URL=redis://chat-redis:6379`, `MAX_MESSAGE_LEN=4096`

---

## Task 7 — Docker Compose (FE + Redis + Mongo)

**`task07-compose/docker-compose.yml`**:

| Service | Image | Config |
|---------|-------|--------|
| `web` | **`nginx:1.25-alpine`** | **`9683:80`** |
| `redis` | **`redis:7.2-alpine`** | |
| `mongo` | **`mongo:7.0`** | user `chatadmin`, pass `chatpass`, vol **`chat-mongo`** |

Network **`chat-compose-net`**

---

## Task 8 — Troubleshooting

**`chat-bot`** broken → **`chat-bot-fixed`**

---

## Task 9 — Security

User **`chatuser`**, **`ubuntu:22.04`**, **`chat-secure:v1`**

---

## Task 10 — Production Challenge

**`task10-prod/`**: **`nginx:stable-alpine`**, **`chatuser`**, HEALTHCHECK, **`9684:8080`**, vol **`chat-prod-data:/data`**, network **`chat-prod-net`**
