# Exam 2 Answers — Travel Booking Portal

> Run from `exam-02-travel/`

---

## Task 1

```bash
docker run -d --name travel-web -p 9180:80 --restart unless-stopped httpd:alpine
docker ps
```

---

## Task 2

```dockerfile
FROM httpd:alpine
COPY promo.html /usr/local/apache2/htdocs/index.html
```

```bash
cd ./task02-promo
# uses provided promo.html
docker build -t travel-promo:v2 .
docker run -d --name travel-promo -p 9181:80 travel-promo:v2
```

---

## Task 3

```bash
docker volume create travel-bookings
docker run -it --name travel-rec1 -v travel-bookings:/records ubuntu
echo "flight=AA100" > /records/booking-001.txt
exit
docker rm -f travel-rec1
docker run -it --name travel-rec2 -v travel-bookings:/records ubuntu
cat /records/booking-001.txt
```

---

## Task 4

```bash
docker run -d --name travel-marketing -p 9182:80 \
  -v $(pwd)/task04-marketing:/usr/share/nginx/html \
  nginx:1.25-alpine
# edit task04-marketing/index.html on host
```

---

## Task 5

```bash
docker network create travel-net
docker run -dit --name travel-payment --network travel-net ubuntu
docker run -dit --name travel-api --network travel-net ubuntu
docker exec -it travel-api bash -c "apt update && apt install -y iputils-ping && ping -c 2 travel-payment"
```

---

## Task 6

```bash
docker run -dit --name travel-envtest \
  -e APP_ENV=production \
  -e PAYMENT_HOST=travel-payment \
  -e CURRENCY=USD \
  ubuntu
docker exec travel-envtest printenv
```

---

## Task 7

```yaml
services:
  web:
    image: nginx
    ports:
      - "9183:80"
    networks:
      - travel-compose-net
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: TravelPass123
    volumes:
      - travel-mysql:/var/lib/mysql
    networks:
      - travel-compose-net
volumes:
  travel-mysql:
networks:
  travel-compose-net:
```

```bash
docker compose up -d && docker compose ps
```

---

## Task 8

```bash
docker logs travel-crash
# No foreground process — container exits
docker rm -f travel-crash
docker run -dit --name travel-crash ubuntu
```

**Root cause:** Started without `-d -i -t` and no persistent CMD.

---

## Task 9

```dockerfile
FROM ubuntu
RUN useradd traveluser
USER traveluser
CMD ["sleep", "infinity"]
```

```bash
docker build -t travel-secure:v1 .
docker run -d --name travel-secure travel-secure:v1
docker exec travel-secure id
```

---

## Task 10

Dockerfile:

```dockerfile
FROM nginx:stable-alpine
RUN adduser -D traveluser
USER traveluser
HEALTHCHECK CMD wget -qO- http://localhost || exit 1
```

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    ports:
      - "9184:8080"
    environment:
      APP_ENV: production
      REGION: eu-west
    volumes:
      - travel-cache:/var/cache/travel
    networks:
      - travel-prod-net
volumes:
  travel-cache:
networks:
  travel-prod-net:
```

```bash
docker compose up -d
docker ps
```
