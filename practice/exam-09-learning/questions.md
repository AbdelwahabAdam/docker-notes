# Docker Practice Exam 9 — Online Learning Platform

**Level:** Mid-Level DevOps Engineer  
**Duration:** 60–90 Minutes  

---

## Task 1 — Container Deployment

| Setting | Value |
|---------|-------|
| Image | **`nginx:1.25-alpine`** |
| Container | **`learn-web`** |
| Ports | **`9880:80`** |
| Restart | **`unless-stopped`** |

---

## Task 2 — Image Creation (FE)

### Provided

- `task02-home/home.html`

**`task02-home/Dockerfile`**, build **`learn-home:v1`**, port **`9881:80`**

---

## Task 3 — Persistent Storage

Volume **`learn-progress`**, file **`/progress/student-42.json`**: `{"lesson":1,"completed":true}`

---

## Task 4 — Host Bind Mount (course materials, read-only)

### Provided

- `task04-courses/lesson.md`

**`learn-courses`** (`ubuntu:22.04`), bind **`task04-courses/`** → **`/courses:ro`**

Verify read works; write inside container must **fail**.

---

## Task 5 — Networking

**`learn-net`**: **`mongo:7.0`** (`learn-mongo`, root/pass `learn123`) + **`ubuntu:22.04`** (`learn-api`), resolve **`learn-mongo`**

---

## Task 6 — Environment Variables

### Provided

- `task06/.env.learn`

Run **`learn-env`** with **`--env-file task06/.env.learn`** plus **`-e PORT=3000`**

Verify `APP_ENV`, `DB_HOST`, `PORT`.

---

## Task 7 — Docker Compose (FE + BE + Mongo + Redis)

### Provided (BE placeholder)

- `task07-compose/be/server.js`
- `task07-compose/be/package.json`

### Required

Create **`task07-compose/docker-compose.yml`** and optionally **`task07-compose/be/Dockerfile`** (*student-created*):

| Service | Image / build | Details |
|---------|---------------|---------|
| `web` | **`nginx:1.25-alpine`** | **`9883:80`**, `depends_on: [backend]` |
| `backend` | Build **`./be`** with base **`node:20-alpine`** OR use `node:20-alpine` + mount + `command: node server.js` | Network only, port 3000 internal |
| `mongo` | **`mongo:7.0`** | root/`learn123`, vol **`learn-mongo`** |
| `redis` | **`redis:7.2-alpine`** | |

Network **`learn-stack-net`**

---

## Task 8 — Troubleshooting

**`learn-worker`** → **`learn-worker-fixed`**

---

## Task 9 — Security

User **`learnuser`**, **`ubuntu:22.04`**, **`learn-secure:v1`**

---

## Task 10 — Production Challenge (multi-stage FE)

### Required in `task10-prod/`

**Multi-stage Dockerfile** (*student-created*):

```dockerfile
FROM node:20-alpine AS base
# development stage (optional CMD)
FROM nginx:1.25-alpine AS production
# non-root learnuser + HEALTHCHECK
```

**`docker-compose.yml`**: build target **`production`**, **`9884:8080`**, volume **`learn-prod:/data`**, network **`learn-prod-net`**, `APP_ENV=production`

Optional: **`docker-compose.dev.yml`** override with bind mount `./src:/app/src:ro`
