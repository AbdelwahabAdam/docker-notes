# Docker Notes — Complete Reference

> Enhanced notes covering definitions, architecture, commands, concepts, and practical examples from this repo.

---

## Table of Contents

1. [What is Docker?](#what-is-docker)
2. [Core Concepts](#core-concepts)
3. [Docker Architecture](#docker-architecture)
4. [Installation & First Run](#installation--first-run)
5. [Container Commands](#container-commands)
6. [Image Commands](#image-commands)
7. [Volume & Storage Commands](#volume--storage-commands)
8. [Network Commands](#network-commands)
9. [Inspect, Logs & Debugging](#inspect-logs--debugging)
10. [Dockerfile Reference](#dockerfile-reference)
11. [Docker Compose Reference](#docker-compose-reference)
12. [Environment Variables](#environment-variables)
13. [Volumes, Bind Mounts & Hot Reload](#volumes-bind-mounts--hot-reload)
14. [Multi-Stage Dockerfiles](#multi-stage-dockerfiles)
15. [Multi-Environment Compose](#multi-environment-compose)
16. [Project Examples (npm_app)](#project-examples-npm_app)
17. [Common Tools: Nginx & Redis](#common-tools-nginx--redis)
18. [Best Practices](#best-practices)
19. [Troubleshooting](#troubleshooting)
20. [Quick Cheat Sheet](#quick-cheat-sheet)

---

## What is Docker?

**Docker** is an open-source platform for building, shipping, and running applications inside **containers**.

| Term | Meaning |
|------|---------|
| **Container** | A lightweight, isolated runtime for an application and its dependencies |
| **Image** | A read-only template used to create containers |
| **Registry** | A store for images (e.g. Docker Hub) |
| **Dockerfile** | A text file with instructions to build an image |
| **Docker Compose** | A tool to define and run multi-container apps using YAML |

**Why Docker?**
- Consistent environments (dev = staging = prod)
- Fast startup compared to VMs
- Portable across machines and cloud providers
- Isolated processes without a full guest OS per app

---

## Core Concepts

### Container

A **container** is a running instance of an image. It includes:
- The application process
- Its filesystem (from the image + any mounted volumes)
- Network interface
- Isolated process space (via Linux namespaces)

Containers are **ephemeral by default** — data inside the container filesystem is lost when the container is removed unless you use volumes.

```bash
docker run -d --name my-app nginx    # create & start a container from an image
docker ps                          # list running containers
docker stop my-app                 # stop gracefully
docker start my-app                # start again
docker rm my-app                   # remove container
```

---

### Image

An **image** is a **read-only, layered filesystem snapshot** plus metadata (entrypoint, env vars, exposed ports).

- Images are built from a **Dockerfile** or pulled from a **registry**
- Images are identified by `repository:tag` (e.g. `nginx:stable-alpine`, `redis:latest`)
- Multiple containers can be created from the same image

```bash
docker pull nginx              # download image from Docker Hub
docker images                  # list local images
docker build -t my-app:1.0 .   # build image from Dockerfile in current dir
docker rmi my-app:1.0          # remove image
```

---

### Virtualization

**Virtualization** creates **Virtual Machines (VMs)** — each VM runs a full guest operating system on top of a **hypervisor**.

```
┌─────────────────────────────────────┐
│           Host Operating System      │
├─────────────────────────────────────┤
│            Hypervisor (VMM)          │
├──────────┬──────────┬───────────────┤
│  Guest OS│  Guest OS│   Guest OS    │
│  App     │  App     │   App         │
└──────────┴──────────┴───────────────┘
```

**How it works:**
1. Hypervisor allocates CPU, RAM, and disk to each VM
2. Each VM boots its own kernel and OS
3. Apps run inside the guest OS

**Pros:** Strong isolation, run different OS types  
**Cons:** Heavy (GBs of disk/RAM), slow boot, more overhead

---

### Hypervisors

A **hypervisor** (Virtual Machine Monitor) manages VMs.

| Type | Examples | Runs on |
|------|----------|---------|
| **Type 1 (bare-metal)** | VMware ESXi, Hyper-V, KVM | Directly on hardware |
| **Type 2 (hosted)** | VirtualBox, VMware Workstation | On top of a host OS |

---

### Virtualization vs Containerization

| | Virtual Machines | Containers (Docker) |
|---|-----------------|---------------------|
| **OS** | Full guest OS per VM | Shares host kernel |
| **Size** | GBs | MBs |
| **Startup** | Minutes | Seconds |
| **Isolation** | Hardware-level (strong) | Process-level (namespaces/cgroups) |
| **Use case** | Different OS, legacy apps | Microservices, CI/CD, dev environments |

```
VMs:                          Containers:
┌─────────────────────┐       ┌─────────────────────┐
│ App │ App │ App     │       │ App │ App │ App     │
├─────┴─────┴─────────┤       ├─────┴─────┴─────────┤
│ Guest OS (×3)       │       │ Docker Engine       │
├─────────────────────┤       ├─────────────────────┤
│ Hypervisor          │       │ Host OS (shared)    │
├─────────────────────┤       ├─────────────────────┤
│ Hardware            │       │ Hardware            │
└─────────────────────┘       └─────────────────────┘
```

**Key insight:** Containers do **not** include a separate operating system — they share the host kernel and isolate processes using **namespaces** and **cgroups**.

---

## Docker Architecture

```
┌──────────────┐         REST API          ┌──────────────────┐
│ Docker Client│ ────────────────────────► │  Docker Daemon   │
│  (docker CLI)│                           │   (dockerd)      │
└──────────────┘                           └────────┬─────────┘
                                                    │
                    ┌───────────────────────────────┼───────────────────────────────┐
                    │                               │                               │
              ┌─────▼─────┐                  ┌──────▼──────┐                 ┌──────▼──────┐
              │  Images   │                  │ Containers  │                 │  Networks   │
              └───────────┘                  └─────────────┘                 └─────────────┘
                    │
              ┌─────▼─────┐
              │  Registry │  (Docker Hub, GHCR, private registries)
              └───────────┘
```

| Component | Role |
|-----------|------|
| **Docker Client** | CLI you type commands into (`docker run`, `docker build`) |
| **Docker Daemon (`dockerd`)** | Background service that builds, runs, and manages containers |
| **Images** | Layered templates stored locally |
| **Containers** | Running (or stopped) instances of images |
| **Registry** | Remote image storage (push/pull) |
| **Namespaces** | Linux kernel feature for isolation (PID, NET, MNT, UTS, IPC, USER) |
| **cgroups** | Limit and account for CPU, memory, I/O per container |

---

## Installation & First Run

```bash
# Verify installation
docker --version
docker info

# Run your first container (downloads hello-world image if needed)
docker run hello-world
```

---

## Container Commands

| Command | Description |
|---------|-------------|
| `docker run [OPTIONS] IMAGE [COMMAND]` | Create and start a container |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers (including stopped) |
| `docker stop <name\|id>` | Stop a running container (SIGTERM, then SIGKILL) |
| `docker start <name\|id>` | Start a stopped container |
| `docker restart <name\|id>` | Restart a container |
| `docker rm <name\|id>` | Remove a stopped container |
| `docker rm -f <name\|id>` | Force remove (even if running) |
| `docker exec -it <name\|id> bash` | Open interactive shell inside running container |
| `docker container prune` | Remove all stopped containers |

### Common `docker run` Options

| Flag | Long form | Description | Example |
|------|-----------|-------------|---------|
| `-d` | `--detach` | Run in background | `docker run -d nginx` |
| `--name` | | Assign container name | `--name web01` |
| `-p` | `--publish` | Map host:container ports | `-p 8080:80` |
| `-e` | `--env` | Set environment variable | `-e NODE_ENV=production` |
| `--env-file` | | Load env vars from file | `--env-file ./.env` |
| `-v` | `--volume` | Mount volume or bind mount | `-v ./src:/app/src:ro` |
| `--network` | | Connect to a network | `--network app-net` |
| `--restart` | | Restart policy | `--restart unless-stopped` |
| `-it` | | Interactive + TTY (for shells) | `docker run -it ubuntu bash` |
| `--rm` | | Auto-remove when container exits | `docker run --rm alpine` |

### Examples

```bash
# Run nginx in background, publish port 80, name it n1
docker container run --detach --publish 80:80 --name n1 nginx

# Run with auto-restart on crash
docker run -d --name web01 -p 8080:80 --restart unless-stopped nginx

# Run redis in background
docker run -d --name redis redis

# Stop / start / remove
docker stop test_nginx_container
docker start test_nginx_container
docker rm test_nginx_container

# Interactive shell inside running container
docker exec -it test_nginx_container bash

# Run ubuntu interactively (keeps container alive)
docker run -dit --name myubuntu ubuntu
```

---

## Image Commands

| Command | Description |
|---------|-------------|
| `docker images` | List local images |
| `docker pull <image:tag>` | Download image from registry |
| `docker build -t <name:tag> .` | Build image from Dockerfile |
| `docker rmi <id\|name>` | Remove an image |
| `docker image rm <id\|name>` | Same as above |
| `docker tag <source> <target>` | Tag/rename an image |
| `docker push <name:tag>` | Push image to registry |
| `docker image prune` | Remove unused images |

### Examples

```bash
docker images
docker pull nginx:stable-alpine
docker build -t express-node-app .
docker build -t company-web:v1 .

# Tag for pushing to your Docker Hub account
docker tag redis mohamedelbitawy/redis
docker tag redis mohamedelbitawy/redis:latest
docker push mohamedelbitawy/redis
```

### Image Tags

Tags identify versions of an image: `repository:tag`

```text
nginx:stable-alpine   →  repository=nginx, tag=stable-alpine
redis                 →  tag defaults to "latest"
node:20               →  Node.js version 20
```

---

## Volume & Storage Commands

the main diffrence between Volum and bind, is the left side of the `:`
for volume, we give it the name of it ex >  vol1:/data
for bind we give it the full path ex > /home/data:/data

| Command | Description |
|---------|-------------|
| `docker volume create <name>` | Create a named volume |
| `docker volume ls` | List volumes |
| `docker volume inspect <name>` | Inspect volume details |
| `docker volume rm <name>` | Remove a volume |
| `docker volume prune` | Remove unused volumes |

### Volume Types

| Type | Syntax | Persists after container removal? | Use case |Notes|
|------|--------|-----------------------------------|----------|----------|
| **Named volume** | `-v dbdata:/data` | Yes | Database data, production |dbdata > volum|
| **Bind mount** | `-v /host/path:/container/path` | Data on host filesystem | Dev hot-reload ||
| **Anonymous volume** | `-v /app/node_modules` | Until no container uses it | Protect dirs from bind mount overwrite ||

### Examples

```bash
# Named volume — persistent storage
docker volume create dbdata
docker run -it --name storage1 -v dbdata:/data ubuntu
echo "backup" > /data/important.txt
docker rm -f storage1
docker run -it --name storage2 -v dbdata:/data ubuntu
cat /data/important.txt    # file still exists

# Bind mount — host directory synced with container
docker run -d --name bindweb -p 8082:80 \
  -v /root/website:/usr/share/nginx/html \
  nginx

# Windows bind mount (PowerShell)
docker run -d -p 4400:4000 \
  -v G:/Devops_Hopa/Docker/npm_app:/app \
  express-node-app

# Read-only bind mount
docker run -d -p 4400:4000 \
  -v G:/Devops_Hopa/Docker/npm_app:/app:ro \
  express-node-app

# Anonymous volume to protect node_modules from bind mount
docker run -d -p 4400:4000 \
  -v G:/Devops_Hopa/Docker/npm_app:/app \
  -v /app/node_modules \
  express-node-app
```

---

## Network Commands

| Command | Description |
|---------|-------------|
| `docker network ls` | List networks |
| `docker network create <name>` | Create custom network |
| `docker network inspect <name>` | Inspect network |
| `docker network connect <net> <container>` | Attach container to network |
| `docker network disconnect <net> <container>` | Detach container |
| `docker network rm <name>` | Remove network |

### Default Networks

| Network | Purpose |
|---------|---------|
| `bridge` | Default; containers on same bridge can communicate by IP |
| `host` | Container uses host network directly (no isolation) |
| `none` | No networking |

### Custom Network Example

```bash
docker network create app-net

docker run -dit --name db01 --network app-net ubuntu
docker run -dit --name app01 --network app-net ubuntu

# Inside app01 — resolve db01 by hostname (Docker DNS)
docker exec -it app01 bash
ping db01
```

---

## Inspect, Logs & Debugging

| Command | Description |
|---------|-------------|
| `docker logs <name\|id>` | View container stdout/stderr |
| `docker logs -f <name\|id>` | Follow logs (live tail) |
| `docker inspect <name\|id>` | Full JSON metadata |
| `docker info` | Docker system info |
| `docker stats` | Live CPU/memory usage |

### Examples

```bash
docker logs express-node-app-container
docker logs -f redis

docker inspect redis
docker inspect --format='{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container-id

docker info
docker stats
```

---

## Dockerfile Reference

A **Dockerfile** is a step-by-step recipe to build an image.

 Dockerfile >>>BUILD>>> docker image >>>RUN>>> Docker Container
### Common Instructions

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image (required first instruction) | `FROM node:20` |
| `WORKDIR` | Set working directory inside container | `WORKDIR /app` |
| `COPY` | Copy files from build context to image | `COPY . /app` |
| `ADD` | Like COPY + can extract tar archives | `ADD app.tar.gz /app` |
| `RUN` | Execute command during build | `RUN npm install` |
| `ENV` | Set environment variable | `ENV PORT=4000` |
| `ARG` | Build-time variable | `ARG NODE_ENV=development` |
| `EXPOSE` | Document which port the app listens on | `EXPOSE 4000` |
| `CMD` | Default command when container starts (one per Dockerfile) | `CMD ["npm", "start"]` |
| `ENTRYPOINT` | Main executable (harder to override) | `ENTRYPOINT ["node"]` |
| `USER` | Run as non-root user | `USER appuser` |
| `HEALTHCHECK` | Define container health probe | See example below |
| `VOLUME` | Declare mount point | `VOLUME ["/data"]` |

### Minimal Examples

**Static website with nginx:**
```dockerfile
FROM nginx
COPY index.html /usr/share/nginx/html/
```

**Node.js app:**
```dockerfile
FROM node:20

WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app

ENV PORT=4000
EXPOSE $PORT

CMD ["npm", "start"]
```

**Non-root + healthcheck (production):**
```dockerfile
FROM nginx

RUN useradd appuser
USER appuser

HEALTHCHECK CMD curl -f http://localhost || exit 1
```

### Build & Run Workflow

```bash
# After creating Dockerfile in project root:
docker build -t express-node-app .          # -t sets image name/tag
docker run --name express-node-app-container -d express-node-app
docker run --name express-node-app-container -d -p 4400:4000 express-node-app
docker exec -it express-node-app-container bash
```

### Image Layers

Each Dockerfile instruction creates a **new layer** in the image:
- Layers are **cached** — unchanged steps are reused on rebuild
- Order matters: put rarely-changing steps (dependencies) before frequently-changing steps (source code)

```dockerfile
# Good layer caching order:
COPY package.json /app/     # changes rarely
RUN npm install             # cached if package.json unchanged
COPY . /app                 # changes often — put last
```

---

## Docker Compose Reference

**Docker Compose** defines multi-container applications in a `docker-compose.yml` file.

### Basic Structure

```yaml
version: "3"

services:
  web:
    image: nginx
    ports:
      - "8080:80"
    restart: unless-stopped

  db:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: redhat
    volumes:
      - dbvol:/var/lib/mysql

volumes:
  dbvol:

networks:
  appnet:
```

### Common Service Keys

| Key | Description |
|-----|-------------|
| `image` | Use a pre-built image |
| `build` | Build from Dockerfile (`context`, `target`, `args`) |
| `ports` | `"host:container"` port mapping |
| `volumes` | Named volumes or bind mounts |
| `environment` | Inline env vars (list or map) |
| `env_file` | Load vars from `.env` file |
| `depends_on` | Start order dependency (not health-aware) |
| `restart` | `no`, `always`, `on-failure`, `unless-stopped` |
| `networks` | Attach to custom networks |
| `command` | Override Dockerfile CMD |
| `container_name` | Fixed container name |

### Compose Commands

| Command | Description |
|---------|-------------|
| `docker compose up` | Create and start all services |
| `docker compose up -d` | Start in background (detached) |
| `docker compose down` | Stop and remove containers/networks |
| `docker compose ps` | List compose services |
| `docker compose logs` | View logs for all services |
| `docker compose logs -f <service>` | Follow logs for one service |
| `docker compose build` | Build/rebuild images |
| `docker compose exec <service> bash` | Shell into running service |

```bash
docker compose up -d
docker compose ps
docker compose logs -f node-app
docker compose down
```

---

## Environment Variables

### Via CLI

```bash
docker run -d \
  --name express-node-app-container \
  -p 4400:4000 \
  -e PORT=4000 \
  -e NODE_ENV=development \
  express-node-app

# From .env file
docker run -d \
  --name express-node-app-container \
  -p 4400:4000 \
  --env-file ./.env \
  express-node-app
```

### Via Dockerfile

```dockerfile
ENV PORT=4000
EXPOSE $PORT
```

### Via Docker Compose

```yaml
services:
  node-app:
    environment:
      - PORT=4400
      - NODE_ENV=development
      - HOPA=DEVOPS
    env_file:
      - ./.env
```

### Verify Inside Container

```bash
docker exec envtest printenv
docker exec express-node-app-container env
```

---

## Volumes, Bind Mounts & Hot Reload

### How Bind Mounts Work

Mounting `host_path:container_path` **syncs** files in both directions:

| Action in container | Effect on host |
|---------------------|----------------|
| Create new file | File appears on host |
| Delete file | File removed from host |
| Edit file | Changes reflected on host |

### Protecting Host Files

**Read-only mount** — container cannot modify host files:
```bash
-v G:/Devops_Hopa/Docker/npm_app:/app:ro
```

**Anonymous volume** — prevents bind mount from overwriting a directory (e.g. `node_modules`):
```bash
-v G:/Devops_Hopa/Docker/npm_app:/app \
-v /app/node_modules
```

The anonymous volume keeps container-installed `node_modules` separate from the host.

### Dev Hot Reload Pattern (Compose)

```yaml
services:
  node-app:
    volumes:
      - ./src:/app/src:ro       # sync source for live edits
    command: npm run start-dev   # nodemon or similar
```

---

## Multi-Stage Dockerfiles

Multi-stage builds let you define **multiple `FROM` stages** in one Dockerfile — useful for dev vs prod with different dependencies.

### Pattern 1: Conditional RUN with ARG

```dockerfile
FROM node:20

ARG NODE_ENV=development

RUN if [ "$NODE_ENV" = "production" ]; \
    then npm install --only=production; \
    else npm install; \
    fi
```

Build with:
```bash
docker build --build-arg NODE_ENV=production -t my-app:prod .
```

### Pattern 2: Named Stages (Recommended)

```dockerfile
FROM node:20 AS base

WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
ENV PORT=4000
EXPOSE $PORT

FROM base AS development
CMD ["npm", "run", "start-dev"]

FROM base AS production
RUN npm prune --production
CMD ["npm", "start"]
```

Build a specific stage:
```bash
docker build --target development -t my-app:dev .
docker build --target production -t my-app:prod .
```

In Compose:
```yaml
build:
  context: .
  target: development    # or production
```

> **Note:** `CMD` in Dockerfile can be overridden by `command:` in Compose.

---

## Multi-Environment Compose

Best practice: one **base** compose file + one file per environment.

```bash
# Dev — merges base + dev overrides
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Prod — merges base + prod overrides
docker compose -f docker-compose.prod.yml up -d

# Tear down prod
docker compose -f docker-compose.prod.yml down
```

### File Responsibilities

| File | Contains |
|------|----------|
| `docker-compose.yml` | Shared services (mongo, redis, nginx), networks, volumes |
| `docker-compose.dev.yml` | Dev build target, bind mounts, dev command |
| `docker-compose.prod.yml` | Production build target, prod env vars, prod command |

---

## Project Examples (npm_app)

This repo includes a full-stack Node.js example with MongoDB, Redis, and Nginx.

### Stack Overview

```
Browser → nginx:8080 → node-app:4000 → mongo_db:27017
                                    → redis:6379
```

### Run Development Stack

```bash
cd npm_app
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

### Run Production Stack

```bash
cd npm_app
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Key Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (base → development / production) |
| `docker-compose.yml` | Base: node-app, mongo, redis, nginx |
| `docker-compose.dev.yml` | Dev overrides: build target, src bind mount |
| `docker-compose.prod.yml` | Prod overrides: production target & command |
| `.dockerignore` | Exclude files from build context |
| `nginx/default.conf` | Reverse proxy to node-app |

### .dockerignore

Prevents unnecessary files from being sent to the Docker daemon during build (faster builds, smaller context):

```
/node_modules
Dockerfile
.env
test_ignore.txt
docker-compose*
```

### Nginx Reverse Proxy Config

```nginx
server {
    listen 80;
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://node-app:4000;
    }
}
```

> Service name `node-app` resolves via Docker Compose internal DNS.

---

## Common Tools: Nginx & Redis

### Nginx

**Nginx** is a high-performance **web server and reverse proxy**.

| Use | Description |
|-----|-------------|
| Static files | Serve HTML, CSS, JS |
| Reverse proxy | Forward requests to backend apps (Node, Python, etc.) |
| Load balancer | Distribute traffic across multiple backends |

```bash
docker run -d --name nginx -p 8080:80 nginx
# Access: http://localhost:8080
```

### Redis

**Redis** is an in-memory **key-value data store** — used for caching, sessions, pub/sub, queues.

```bash
docker run -d --name redis -p 6379:6379 redis
docker exec -it redis redis-cli
# > SET greeting "Hello"
# > GET greeting
```

In this project, the Node app connects via:
```javascript
createClient({ url: 'redis://redis:6379' })
```

---

## Best Practices

### General
- Use **specific image tags** (`node:20`) instead of `latest` in production
- Run containers as **non-root** (`USER appuser`)
- Use **`.dockerignore`** to exclude `node_modules`, `.env`, git files
- One process per container (or use a proper init system)
- Use **named volumes** for database persistence
- Use **healthchecks** for production services

### Dockerfile
- Order instructions for **layer caching** (dependencies before source)
- Use **multi-stage builds** to keep production images small
- Prefer `COPY` over `ADD` unless you need archive extraction
- Use `CMD` with exec form: `CMD ["npm", "start"]` (no shell wrapper)

### Compose
- Separate compose files per environment
- Never commit secrets — use `.env` files (add to `.gitignore`)
- Use `restart: unless-stopped` for long-running services
- Use custom networks so services resolve each other by name

### Security
- Do not run as root in production
- Use read-only bind mounts (`:ro`) where possible
- Scan images for vulnerabilities (`docker scout`, Trivy)
- Limit container resources with `--memory` and `--cpus`

---

## Troubleshooting

### Container exits immediately

```bash
docker ps -a                  # check STATUS (Exited?)
docker logs broken01          # read exit reason
docker inspect broken01       # full config
```

**Common cause:** No foreground process. Fix:
```bash
# Wrong — exits when bash session ends
docker run ubuntu

# Correct — detached interactive with a keep-alive process
docker run -dit ubuntu
```

### Port already in use

```bash
docker ps                     # find container using the port
docker stop <container>
# Or use a different host port: -p 8081:80
```

### Cannot connect to service by name

- Ensure containers are on the **same custom network**
- Use the **service name** from compose (not container_name) for inter-service DNS
- Check `depends_on` — service may not be ready yet (use healthchecks for production)

### Permission errors with bind mounts (Linux)

```bash
# Fix ownership or run with matching UID
docker run -u $(id -u):$(id -g) ...
```

### View container IP

```bash
docker inspect --format='{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-id>
```

### Clean up everything unused

```bash
docker system prune          # remove stopped containers, unused networks, dangling images
docker system prune -a       # also remove unused images
docker volume prune          # remove unused volumes
```

---

## Quick Cheat Sheet

```bash
# ── Images ──────────────────────────────────────────
docker images
docker pull nginx:stable-alpine
docker build -t myapp:1.0 .
docker rmi myapp:1.0
docker tag myapp:1.0 user/myapp:1.0
docker push user/myapp:1.0

# ── Containers ──────────────────────────────────────
docker run -d --name web -p 8080:80 --restart unless-stopped nginx
docker ps / docker ps -a
docker stop web && docker start web && docker restart web
docker rm web / docker rm -f web
docker exec -it web bash
docker logs -f web

# ── Volumes ─────────────────────────────────────────
docker volume create dbdata
docker volume ls
docker run -v dbdata:/data ubuntu
docker run -v /host/path:/container/path nginx

# ── Networks ────────────────────────────────────────
docker network create app-net
docker network ls
docker run --network app-net --name app01 ubuntu

# ── Env vars ────────────────────────────────────────
docker run -e KEY=value --env-file .env myapp

# ── Compose ─────────────────────────────────────────
docker compose up -d
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose ps
docker compose logs -f
docker compose down

# ── System ──────────────────────────────────────────
docker info
docker inspect <name>
docker stats
docker system prune
```

---

*Last updated: June 2026 — based on repo examples in `npm_app/` and `exam_docker.md`*
