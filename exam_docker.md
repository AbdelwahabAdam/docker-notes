# Docker Mock Exam 1

**Level:** Mid-Level DevOps Engineer
**Duration:** 60–90 Minutes

---

# Task 1 - Container Deployment

## Scenario

A development team needs a temporary web server for testing.

### Required

1. Run a container named `web01` from the nginx image.
2. Publish the service on port `8080` of the host.
3. Configure the container to restart automatically if it crashes.
4. Verify the container is running.

---

## Answer

```bash
docker run -d \
--name web01 \
-p 8080:80 \
--restart unless-stopped \
nginx
```

Verify:

```bash
docker ps
```

---

# Task 2 - Image Creation

## Scenario

A web developer provides an HTML file located in:

```text
/root/project/index.html
```

The application must be deployed as a custom Docker image.

### Required

1. Create a Dockerfile.
2. Use nginx as the base image.
3. Copy the HTML file into the nginx web root.
4. Build the image as:

```text
company-web:v1
```

5. Run the container and publish it on port 8081.

---

## Answer

Dockerfile:

```dockerfile
FROM nginx

COPY index.html /usr/share/nginx/html/
```

Build:

```bash
docker build -t company-web:v1 .
```

Run:

```bash
docker run -d \
--name company-web \
-p 8081:80 \
company-web:v1
```

---

# Task 3 - Persistent Storage

## Scenario

A database administrator requires persistent storage for application data.

### Required

1. Create a Docker volume named:

```text
dbdata
```

2. Start an Ubuntu container using that volume mounted at:

```text
/data
```

3. Create a file:

```text
/data/important.txt
```

4. Remove the container.
5. Create a new container using the same volume.
6. Verify the file still exists.

---

## Answer

Create volume:

```bash
docker volume create dbdata
```

Run:

```bash
docker run -it \
--name storage1 \
-v dbdata:/data \
ubuntu
```

Create file:

```bash
echo "backup" > /data/important.txt
```

Remove:

```bash
docker rm -f storage1
```

New container:

```bash
docker run -it \
--name storage2 \
-v dbdata:/data \
ubuntu
```

Verify:

```bash
cat /data/important.txt
```

---

# Task 4 - Host Bind Mount

## Scenario

Developers require direct access to application files from the host.

### Required

1. Create:

```text
/root/website
```

2. Place an index.html file in that directory.
3. Run an nginx container.
4. Mount the directory into:

```text
/usr/share/nginx/html
```

5. Verify updates appear without rebuilding the image.

---

## Answer

```bash
mkdir /root/website
```

```bash
echo "Docker Exam" > /root/website/index.html
```

```bash
docker run -d \
--name bindweb \
-p 8082:80 \
-v /root/website:/usr/share/nginx/html \
nginx
```

Modify:

```bash
echo "Updated Page" > /root/website/index.html
```

Refresh browser.

---

# Task 5 - Networking

## Scenario

An application server must communicate with a database container.

### Required

1. Create a custom network named:

```text
app-net
```

2. Deploy two Ubuntu containers:

```text
app01
db01
```

3. Attach both containers to app-net.
4. Verify app01 can resolve db01 by hostname.

---

## Answer

```bash
docker network create app-net
```

```bash
docker run -dit \
--name db01 \
--network app-net \
ubuntu
```

```bash
docker run -dit \
--name app01 \
--network app-net \
ubuntu
```

Test:

```bash
docker exec -it app01 bash
```

```bash
apt update
apt install iputils-ping -y
```

```bash
ping db01
```

---

# Task 6 - Environment Variables

## Scenario

Application settings must be injected during runtime.

### Required

Create a container named:

```text
envtest
```

With the following variables:

```text
APP_ENV=production
DB_HOST=mysql
DB_PORT=3306
```

Verify the variables inside the container.

---

## Answer

```bash
docker run -dit \
--name envtest \
-e APP_ENV=production \
-e DB_HOST=mysql \
-e DB_PORT=3306 \
ubuntu
```

Verify:

```bash
docker exec envtest printenv
```

---

# Task 7 - Docker Compose

## Scenario

A company requires deployment of a web and database stack.

### Required

Create a compose file that:

1. Deploys nginx.
2. Deploys mysql.
3. Uses a persistent volume.
4. Uses a custom network.
5. Starts all services.

---

## Answer

```yaml
services:

  web:
    image: nginx
    ports:
      - "8080:80"

  db:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: redhat
    volumes:
      - dbvol:/var/lib/mysql

volumes:
  dbvol:
```

Deploy:

```bash
docker compose up -d
```

Verify:

```bash
docker compose ps
```

---

# Task 8 - Troubleshooting

## Scenario

The container:

```text
broken01
```

starts and immediately exits.

### Required

1. Determine why.
2. Correct the issue.
3. Ensure the container remains running.

---

## Answer

Check:

```bash
docker ps -a
```

Inspect logs:

```bash
docker logs broken01
```

Inspect configuration:

```bash
docker inspect broken01
```

Common cause:

Container started without a foreground process.

Wrong:

```bash
docker run ubuntu
```

Correct:

```bash
docker run -dit ubuntu
```

---

# Task 9 - Security

## Scenario

Security policy prohibits running applications as root.

### Required

1. Create a Docker image.
2. Create user:

```text
appuser
```

inside the image.
3. Configure the container to run as appuser.
4. Verify the running UID is not root.

---

## Answer

Dockerfile:

```dockerfile
FROM ubuntu

RUN useradd appuser

USER appuser

CMD ["sleep","infinity"]
```

Build:

```bash
docker build -t secure:v1 .
```

Run:

```bash
docker run -d \
--name secure01 \
secure:v1
```

Verify:

```bash
docker exec secure01 id
```

Expected:

```text
uid=1000(appuser)
```

---

# Task 10 - Production Deployment Challenge

## Scenario

You must deploy a production-ready application.

### Required

Deploy an application that satisfies all of the following:

1. Custom image.
2. Non-root execution.
3. Healthcheck configured.
4. Persistent volume.
5. Custom network.
6. Environment variables.
7. Restart policy.
8. Docker Compose deployment.

---

## Answer

Dockerfile:

```dockerfile
FROM nginx

RUN useradd appuser

USER appuser

HEALTHCHECK CMD curl -f http://localhost || exit 1
```

docker-compose.yml:

```yaml
services:

  app:
    build: .
    restart: unless-stopped

    environment:
      APP_ENV: production

    volumes:
      - appdata:/data

    networks:
      - appnet

volumes:
  appdata:

networks:
  appnet:
```

Deploy:

```bash
docker compose up -d
```

Verify:

```bash
docker ps
docker volume ls
docker network ls
docker inspect <container_name>
```
