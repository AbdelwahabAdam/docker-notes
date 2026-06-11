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
16. [Docker Orchestration](#docker-orchestration)
17. [Project Examples (npm_app)](#project-examples-npm_app)
18. [Scaling with Nginx](#scaling-with-nginx)
19. [Automating Deployments with Watchtower](#automating-deployments-with-watchtower)
20. [Common Tools: Nginx & Redis](#common-tools-nginx--redis)
21. [Best Practices](#best-practices)
22. [Troubleshooting](#troubleshooting)
23. [Quick Cheat Sheet](#quick-cheat-sheet)

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

## Docker Orchestration

**Container orchestration** is the automated management of containerized applications — especially when you run **many containers across one or more servers** and need them to stay healthy, scale, and update without manual intervention.

Running a single container with `docker run` is simple. Running a production system with web servers, APIs, databases, caches, load balancers, and background workers — across multiple machines — requires **orchestration**.

### Manual Docker vs orchestration

| Manual (`docker run` / basic scripts) | Orchestration |
|---------------------------------------|---------------|
| You start/stop each container yourself | Platform decides where and when containers run |
| One host, few containers | Many hosts, hundreds of containers |
| Crash = manual restart | Automatic restart on failure |
| Scaling = run more commands by hand | Scale with a number: `replicas: 5` |
| Updates = downtime or manual swap | Rolling updates with zero/minimal downtime |
| Networking wired manually | Built-in service discovery and load balancing |

### What an orchestrator does

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION PLATFORM                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Schedule │ │  Scale   │ │  Health  │ │   Rolling    │  │
│  │ (where   │ │ (how     │ │  checks  │ │   updates    │  │
│  │ to run)  │ │  many)   │ │ & restart│ │ & rollback   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Service  │ │ Secrets  │ │ Storage  │ │   Load       │  │
│  │ discovery│ │ & config │ │ volumes  │ │   balancing  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐       ┌───────────┐       ┌───────────┐
   │  Worker   │       │  Worker   │       │  Worker   │
   │  Node 1   │       │  Node 2   │       │  Node 3   │
   │ [app][db] │       │ [app][app]│       │ [app][lb] │
   └───────────┘       └───────────┘       └───────────┘
```

| Responsibility | Explanation |
|----------------|-------------|
| **Scheduling** | Places containers on nodes with enough CPU/RAM |
| **Scaling** | Runs more or fewer replicas based on demand or config |
| **Self-healing** | Restarts failed containers; replaces unhealthy ones |
| **Networking** | Connects services by name across hosts |
| **Load balancing** | Distributes traffic across replicas |
| **Rolling updates** | Deploys new versions gradually, rolls back on failure |
| **Secrets & config** | Injects env vars, passwords, and config safely |
| **Storage** | Attaches persistent volumes to the right containers |

### Docker orchestration tools

Docker ecosystem offers several levels of orchestration:

```
Complexity / capability ──────────────────────────────────────►

  docker run          Docker Compose       Docker Swarm         Kubernetes
  (1 container)       (multi-container,    (Docker-native       (industry standard,
                       1 host)             cluster)             multi-cloud)
```

#### 1. Docker Compose — lightweight orchestration

**What:** YAML file defines multi-container apps on **a single host**.

**Good for:** Local dev, testing, small deployments, homelab.

```bash
docker compose up -d
docker compose up -d --scale node-app=3
```

**Limitations:** Single machine, no built-in cluster failover across servers.

See [Docker Compose Reference](#docker-compose-reference) and [Multi-Environment Compose](#multi-environment-compose).

#### 2. Docker Swarm — Docker-native clustering

**What:** Built into Docker Engine — turns multiple servers into a **Swarm cluster** (manager + worker nodes).

**Good for:** Simple production clusters without leaving the Docker toolchain.

```bash
# Initialize swarm on manager node
docker swarm init

# Join worker nodes
docker swarm join --token <token> <manager-ip>:2377

# Deploy a stack from compose file
docker stack deploy -c docker-compose.yml myapp

# Scale a service
docker service scale myapp_web=5
docker service ls
```

**Swarm compose example** (`deploy` section):

```yaml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "8080:80"
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      update_config:
        parallelism: 1
        delay: 10s
```

| Swarm concept | Meaning |
|---------------|---------|
| **Manager node** | Controls the cluster, schedules tasks |
| **Worker node** | Runs containers assigned by manager |
| **Service** | Desired state — e.g. "run 3 nginx replicas" |
| **Task** | One running container instance of a service |
| **Stack** | Group of services deployed together (like Compose) |

#### 3. Kubernetes (K8s) — full orchestration platform

**What:** Powerful, widely adopted orchestrator — runs containers as **Pods** managed by **Deployments** across a cluster.

**Good for:** Large production, multi-cloud, teams needing rich ecosystem (Helm, operators, autoscaling).

```bash
kubectl apply -f deployment.yaml
kubectl get pods
kubectl scale deployment node-app --replicas=5
kubectl rollout status deployment/node-app
```

**Minimal Kubernetes Deployment example:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
        - name: node-app
          image: youruser/express-node-app:1.0.0
          ports:
            - containerPort: 4000
```

> Kubernetes has a steep learning curve but is the standard for cloud-native production.

### Comparison table

| Feature | Compose | Swarm | Kubernetes |
|---------|---------|-------|------------|
| **Hosts** | Single | Multi (cluster) | Multi (cluster) |
| **Setup complexity** | Low | Medium | High |
| **Built into Docker** | Yes (plugin) | Yes | No (separate install) |
| **Auto-restart** | `restart:` policy | Yes | Yes |
| **Multi-host networking** | No | Yes (overlay) | Yes |
| **Rolling updates** | Manual / Watchtower | Built-in | Built-in |
| **Auto-scaling (CPU/RAM)** | No | Limited | Yes (HPA) |
| **Ecosystem / jobs market** | Small | Small | Very large |
| **Best for** | Dev, small apps | Simple prod clusters | Enterprise / cloud |

### Other orchestrators (brief)

| Tool | Notes |
|------|-------|
| **HashiCorp Nomad** | Schedules containers, VMs, binaries — simpler than K8s |
| **Amazon ECS** | AWS-managed container orchestration |
| **Azure Container Apps** | Serverless containers on Azure |
| **Google Cloud Run** | Fully managed, scale-to-zero |

### When to use what

| Situation | Recommended tool |
|-----------|------------------|
| Learning Docker, local dev | **Docker Compose** |
| This repo's `npm_app` stack | **Docker Compose** |
| Single VPS, auto-updates | **Compose + Watchtower** — see [Automating Deployments with Watchtower](#automating-deployments-with-watchtower) |
| Load balancing replicas on one host | **Compose + Nginx** — see [Scaling with Nginx](#scaling-with-nginx) |
| Few servers, stay in Docker ecosystem | **Docker Swarm** |
| Production at scale, cloud-native | **Kubernetes** |
| CI/CD builds images, simple redeploy | **Compose or Swarm** on VPS; K8s in cloud |

### Orchestration in this repo (learning path)

```
1. docker run / docker compose     ← you are here (fundamentals)
2. compose multi-env + nginx scale   ← production patterns on one host
3. watchtower                      ← automated image updates
4. docker swarm (optional)         ← multi-node Docker cluster
5. kubernetes (optional)             ← full cloud-native orchestration
```

**Key takeaway:** **Docker Compose** is orchestration for **one machine**. **Swarm** and **Kubernetes** are orchestration for **clusters** — they solve scheduling, scaling, healing, and updates across many servers automatically.

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

## Scaling with Nginx

When traffic grows, a single app container becomes a bottleneck. **Nginx** sits in front as a **reverse proxy and load balancer**, distributing requests across **multiple replicas** of the same service.

### Why scale with Nginx?

| Problem (single container) | Solution (Nginx + replicas) |
|----------------------------|-------------------------------|
| One container handles all traffic | Traffic split across N replicas |
| Container crash = full outage | Other replicas keep serving |
| CPU/memory limit on one process | Horizontal scaling adds capacity |
| Deploy causes downtime | Rolling updates with multiple instances |

### Architecture

```
                    ┌─────────────┐
   Browser ────────►│   nginx     │  :8080 (single entry point)
                    │  (proxy/LB) │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ node-app-1 │  │ node-app-2 │  │ node-app-3 │
    │   :4000    │  │   :4000    │  │   :4000    │
    └────────────┘  └────────────┘  └────────────┘
```

Nginx receives all public traffic. Backend containers stay on the **internal Docker network** — only nginx publishes a host port.

### Scale with Docker Compose

Run multiple replicas of a service with `--scale`:

```bash
cd npm_app
docker compose up -d --scale node-app=3
docker compose ps
```

Compose creates containers like `npm_app-node-app-1`, `npm_app-node-app-2`, `npm_app-node-app-3`. The **service name** `node-app` still resolves via Docker DNS to all replica IPs.

| Command | Effect |
|---------|--------|
| `docker compose up -d --scale node-app=3` | Start 3 replicas of `node-app` |
| `docker compose up -d --scale node-app=1` | Scale back down to 1 |
| `docker compose ps` | See all running replicas |

> **Note:** Do not set `container_name` on services you plan to scale — each replica needs a unique name.

### Nginx upstream block

Define backends in an **`upstream`** group, then `proxy_pass` to that group:

```nginx
upstream node_backend {
    least_conn;                        # load balancing method (see table below)
    server node-app:4000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://node_backend;
        proxy_redirect off;
    }
}
```

Save as `npm_app/nginx/default.conf` (replace the single `proxy_pass http://node-app:4000` line).

### Load balancing methods

| Method | Directive | Behavior | Use when |
|--------|-----------|----------|----------|
| Round robin | *(default)* | Requests rotate across servers | General purpose |
| Least connections | `least_conn;` | Sends to server with fewest active connections | Long-lived / uneven requests |
| IP hash | `ip_hash;` | Same client IP → same backend | Sticky sessions needed |
| Weighted | `server x:4000 weight=3;` | More traffic to higher weight | Mixed server capacity |

Example with explicit weights:

```nginx
upstream node_backend {
    server node-app:4000 weight=3;
    # Add more server lines if using fixed hostnames/IPs
}
```

### Full example: scaled `npm_app` stack

**1. Update `docker-compose.yml`** — remove fixed `container_name` from `node-app` if present, keep nginx as the only published web port:

```yaml
services:
  node-app:
    # container_name: express-node-app-container  # remove for scaling
    env_file:
      - ./.env
    depends_on:
      - mongo_db
      - redis
    # no ports — nginx is the entry point

  nginx:
    image: nginx:stable-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - node-app
```

**2. Deploy with 3 replicas:**

```bash
docker compose up -d --build --scale node-app=3
```

**3. Verify load distribution:**

```bash
# Run several requests — check logs on each replica
docker compose logs -f node-app
curl http://localhost:8080/
curl http://localhost:8080/data
```

**4. Check which containers are running:**

```bash
docker compose ps node-app
docker inspect $(docker compose ps -q node-app) --format='{{.Name}}'
```

### Health checks and failover

Nginx marks a backend **down** after failed requests (`max_fails`) for a period (`fail_timeout`):

```nginx
upstream node_backend {
    least_conn;
    server node-app:4000 max_fails=3 fail_timeout=30s;
}
```

For production, also add **Docker healthchecks** on app containers so Compose/Kubernetes removes unhealthy replicas before nginx sends traffic to them:

```yaml
services:
  node-app:
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:4000/"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
```

### Scaling patterns summary

| Pattern | How | Best for |
|---------|-----|----------|
| **Compose scale** | `docker compose up --scale service=N` | Dev/staging, simple horizontal scale |
| **Nginx upstream** | Multiple backends in `upstream {}` | Any multi-container backend |
| **Docker Swarm** | `deploy.replicas: 3` in compose | Production orchestration |
| **Kubernetes** | `replicas: 3` in Deployment + Ingress | Large production clusters |

### Common mistakes

- **Publishing ports on every replica** — only the load balancer (nginx) needs a host port.
- **Using `container_name`** — prevents scaling; let Compose generate names.
- **Session data in memory** — scaling breaks sticky user sessions unless you use Redis/DB for sessions or `ip_hash`.
- **No healthchecks** — nginx may keep sending traffic to a crashed container until `max_fails` triggers.

---

## Automating Deployments with Watchtower

**Watchtower** is a container that **automatically updates your running containers** when a newer image is pushed to the registry. It watches local containers, pulls the latest image, and recreates containers with the same settings (ports, volumes, env vars).

### How it works

```
┌──────────────┐     poll      ┌─────────────┐     pull new tag    ┌──────────────┐
│  Watchtower  │──────────────►│   Registry  │────────────────────►│ Local images │
│  container   │               │ Docker Hub  │                     └──────┬───────┘
└──────┬───────┘               └─────────────┘                            │
       │                                                                   │
       │  stop → remove → recreate                                         │
       ▼                                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  nginx, node-app, redis, mongo ... (running containers on this host)         │
└──────────────────────────────────────────────────────────────────────────────┘
```

1. Watchtower runs on a schedule (default: every 24 hours).
2. It checks the registry for newer versions of images used by running containers.
3. If a new image exists, it stops the old container, pulls the image, and starts a new container with the **same configuration**.
4. Optional: removes old images after update (`WATCHTOWER_CLEANUP`).

### Basic setup (Docker CLI)

```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower
```

| Flag / mount | Purpose |
|--------------|---------|
| `-v /var/run/docker.sock:/var/run/docker.sock` | Required — lets Watchtower manage containers on this host |
| `--restart unless-stopped` | Watchtower itself survives reboots |

> **Windows (Docker Desktop):** the socket mount path is the same — Docker Desktop exposes `/var/run/docker.sock` inside the Linux VM.

### Common environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WATCHTOWER_POLL_INTERVAL` | `86400` (24h) | Seconds between checks — e.g. `300` = every 5 minutes |
| `WATCHTOWER_CLEANUP` | `false` | Remove old images after update |
| `WATCHTOWER_INCLUDE_STOPPED` | `false` | Also update stopped containers |
| `WATCHTOWER_REVIVE_STOPPED` | `false` | Start stopped containers after updating |
| `WATCHTOWER_RUN_ONCE` | `false` | Check once and exit (good for CI/cron) |
| `WATCHTOWER_LABEL_ENABLE` | `false` | Only update containers with explicit label |
| `WATCHTOWER_NO_STARTUP_MESSAGE` | `false` | Suppress startup log message |
| `TZ` | — | Timezone for logs — e.g. `Africa/Cairo` |

Example — poll every 5 minutes and clean up old images:

```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -e WATCHTOWER_POLL_INTERVAL=300 \
  -e WATCHTOWER_CLEANUP=true \
  -e TZ=UTC \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower
```

One-shot update (run once, then exit):

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --run-once
```

### Docker Compose integration

Add Watchtower as a service alongside your stack:

```yaml
services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_POLL_INTERVAL: 300
      WATCHTOWER_CLEANUP: "true"
      TZ: UTC
    # Optional: only update labeled containers
    # environment:
    #   WATCHTOWER_LABEL_ENABLE: "true"
```

Deploy:

```bash
docker compose up -d watchtower
docker logs -f watchtower
```

### Selective updates with labels

By default, Watchtower updates **all** running containers. For production, enable label mode so only chosen services auto-update:

**Watchtower service:**

```yaml
watchtower:
  image: containrrr/watchtower
  environment:
    WATCHTOWER_LABEL_ENABLE: "true"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

**App service to auto-update:**

```yaml
node-app:
  image: youruser/express-node-app:latest
  labels:
    - "com.centurylinklabs.watchtower.enable=true"
```

**Service to exclude** (no label, or explicit disable):

```yaml
mongo_db:
  image: mongo:7.0
  labels:
    - "com.centurylinklabs.watchtower.enable=false"
```

> Do **not** auto-update databases blindly — data migrations and compatibility need planning.

### Private registry authentication

Watchtower uses the same credentials as Docker on the host. Log in first:

```bash
docker login
# enter username, password, registry (e.g. ghcr.io)
```

Or mount the config file into Watchtower:

```yaml
watchtower:
  image: containrrr/watchtower
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - ~/.docker/config.json:/config.json
  environment:
    DOCKER_CONFIG: /
```

For Docker Hub rate limits, use a personal access token as the password.

### Example workflow with `npm_app`

Typical automated deployment pipeline:

```bash
# 1. Build and push a new image (CI/CD or manual)
cd npm_app
docker build -t youruser/express-node-app:1.2.0 --target production .
docker tag youruser/express-node-app:1.2.0 youruser/express-node-app:latest
docker push youruser/express-node-app:latest

# 2. Watchtower detects :latest changed and recreates node-app container
# 3. Verify on the server
docker logs -f watchtower
docker compose ps
curl http://localhost:8080/
```

Use **specific tags** (`1.2.0`) in compose for reproducibility, or **`latest`** if you want Watchtower to always track the newest build:

```yaml
node-app:
  image: youruser/express-node-app:latest
  labels:
    - "com.centurylinklabs.watchtower.enable=true"
```

### Notifications (optional)

Watchtower can notify you when updates happen via email, Slack, Discord, etc.

```yaml
watchtower:
  environment:
    WATCHTOWER_NOTIFICATIONS: shoutrrr
    WATCHTOWER_NOTIFICATION_URL: discord://token@channel
    # or: slack://token@channel
    # or: smtp://user:pass@host:port/?from=...&to=...
```

### Security considerations

| Risk | Mitigation |
|------|------------|
| Docker socket access = root on host | Run Watchtower only on trusted servers; restrict who can deploy |
| Unexpected breaking updates | Use specific tags, test in staging, enable `WATCHTOWER_LABEL_ENABLE` |
| Database containers restarted mid-write | Exclude DB services with labels |
| Registry credentials on host | Use read-only registry tokens; rotate credentials |
| No rollback built-in | Keep previous image tags; redeploy old tag manually if needed |

### Watchtower vs other approaches

| Tool | Scope | Best for |
|------|-------|----------|
| **Watchtower** | Single host, pull & recreate containers | Homelab, VPS, simple prod |
| **CI/CD (GitHub Actions, Jenkins)** | Build + deploy on git push | Teams, tests before deploy |
| **Docker Swarm / Kubernetes** | Orchestrated rolling updates | Multi-node production |
| **Portainer** | UI + webhooks + updates | GUI-driven management |

### Troubleshooting Watchtower

```bash
docker logs watchtower                    # see what it checked/updated
docker logs watchtower 2>&1 | tail -50

# Force a manual one-shot check
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --run-once

# Container not updating?
# - Image tag must exist on registry (did you push?)
# - Same tag digest must change (:latest with new push)
# - Label enable mode? Container needs com.centurylinklabs.watchtower.enable=true
# - docker login required for private images
```

---

## Common Tools: Nginx & Redis

### Nginx

**Nginx** is a high-performance **web server and reverse proxy**.

| Use | Description |
|-----|-------------|
| Static files | Serve HTML, CSS, JS |
| Reverse proxy | Forward requests to backend apps (Node, Python, etc.) |
| Load balancer | Distribute traffic across multiple backends — see [Scaling with Nginx](#scaling-with-nginx) |

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
- Use **Watchtower** with labels to auto-update only safe services — exclude databases

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
docker compose up -d --scale node-app=3    # scale a service
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
docker compose ps
docker compose logs -f
docker compose down

# ── Watchtower (auto-update) ────────────────────────
docker run -d --name watchtower --restart unless-stopped \
  -e WATCHTOWER_POLL_INTERVAL=300 -e WATCHTOWER_CLEANUP=true \
  -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower
docker logs -f watchtower
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower --run-once

# ── System ──────────────────────────────────────────
docker info
docker inspect <name>
docker stats
docker system prune
```

---

*Last updated: June 2026 — based on repo examples in `npm_app/` and `exam_docker.md`*
