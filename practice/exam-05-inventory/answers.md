# Exam 5 Answers — Inventory Management

---

## Task 1

```bash
docker run -d \
  --name inventory-db-temp \
  -e MARIADB_ROOT_PASSWORD=warehouse123 \
  -p 9480:3306 \
  --restart unless-stopped \
  mariadb:10
docker ps
```

---

## Task 2

```dockerfile
FROM nginx
COPY dashboard.html /usr/share/nginx/html/index.html
```

```bash
mkdir -p /opt/inventory
echo "<h1>Inventory Dashboard</h1>" > /opt/inventory/dashboard.html
cd /opt/inventory
docker build -t inventory-dash:v1 .
docker run -d --name inventory-dash -p 9481:80 inventory-dash:v1
```

---

## Task 3

```bash
docker volume create inventory-stock
docker run -it --name inv-store-a -v inventory-stock:/stock ubuntu
echo "items=500" > /stock/count.txt && exit
docker rm -f inv-store-a
docker run -it --name inv-store-b -v inventory-stock:/stock ubuntu
cat /stock/count.txt
```

---

## Task 4

```bash
mkdir -p /opt/inventory/imports
echo "sku,name\n1,widget" > /opt/inventory/imports/items.csv
docker run -dit --name inventory-import \
  -v /opt/inventory/imports:/imports ubuntu
docker exec inventory-import cat /imports/items.csv
```

---

## Task 5

```bash
docker network create inventory-net
docker run -d --name inventory-mariadb --network inventory-net \
  -e MARIADB_ROOT_PASSWORD=pass mariadb:10
docker run -dit --name inventory-api --network inventory-net ubuntu
docker exec inventory-api getent hosts inventory-mariadb
```

---

## Task 6

```bash
docker run -dit --name inventory-sync \
  -e APP_ENV=production \
  -e DB_HOST=inventory-mariadb \
  -e SYNC_INTERVAL=300 \
  ubuntu
docker exec inventory-sync printenv
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9483:80"
    networks:
      - inventory-compose-net
  db:
    image: mariadb:10
    environment:
      MARIADB_ROOT_PASSWORD: inv123
    volumes:
      - inventory-db:/var/lib/mysql
    networks:
      - inventory-compose-net
  adminer:
    image: adminer
    ports:
      - "9485:8080"
    networks:
      - inventory-compose-net
volumes:
  inventory-db:
networks:
  inventory-compose-net:
```

---

## Task 8

```bash
docker logs inventory-cron
docker rm -f inventory-cron
docker run -dit --name inventory-cron ubuntu
```

**Root cause:** No long-running process in foreground.

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd invuser
USER invuser
CMD ["sleep", "infinity"]
```

```bash
docker build -t inventory-secure:v1 .
docker run -d --name inventory-secure inventory-secure:v1
docker exec inventory-secure id
```

---

## Task 10

```dockerfile
FROM nginx
RUN useradd invuser
USER invuser
HEALTHCHECK CMD curl -f http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9484:8080"
    environment:
      APP_ENV: production
    volumes:
      - inventory-reports:/reports
    networks:
      - inventory-prod-net
volumes:
  inventory-reports:
networks:
  inventory-prod-net:
```
