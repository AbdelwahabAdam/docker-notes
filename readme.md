# Docker
- Open Source Standalone application


### Docker basics

#### Container:
- container is ..


#### Image:
- Image is ....


#### Virtualization:
- Virtualization is ...
- how Virtualization works?
- ...

#### hypervisors:
- hypervisors is ..


#### Virtualization VS Containerization
- 

- no operation system!

#### Docker Architecture

-image
-container
- registry
- client
- docker demon
- Namespace

-----
#### Basic commands

# TODO: seperate images command than continers commands
# TODO: add options under each commands ex -d -a
- docker run hello-world 

- docker ps -a

- docker rm <id_or_name>

- docker images

- docker image rm <id_or_name>


- docker run -d radis  

- docker inspect redis

- docker logs <id_or_name>

- docker info 

- docker inspect --format='{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container-id



- $ docker container run --detach --publish 80:80 --name n1 nginx
- docker stop test_nginx_container
- docker start test_nginx_container

-  docker exec   -it  test_nginx_container bash
-----

### Docker conecpts

#### Docker Tags:
- docker tag
- docker tag redis mohamedelbitawy/redis

#### Image Layers:
#### Dockerfile:
#### Docker Compose:



-----
#### Important Notes:

- .dockerignore
- docker containers are isolated 

- docker logs express-node-app-container


show all docker images: docker images
 
show all docker containers: docker ps -a



- after creating a docker file, we can run

- docker build -t express-node-app .                                                >>> -t  to pass the image name

- docker run --name express-node-app-container -d express-node-app                  >>> -d is detash from terminal, meaning do not show logs in the current shell and work in bg
- docker run --name express-node-app-container -d  -p 4400:4000  express-node-app   >>> -p for port forwarding, the 4400 is the current machine, and the 4000 is the container.

- docker exec -it express-node-app-container                                        >>> interactive mode in docker

- docker rm <container_name_or_id>

- docker ps

#### add env var
`- env`
- `docker run --name express-node-app-container -d -p 4400:4000 -v %cd%/src:/app/src:ro --env PORT=4000 --env NODE_ENV=development express-node-add`

- in docker file
ENV PORT=4000

EXPOSE $PORT

- .env file

- `docker run --name express-node-app-container -d -p 4400:4000 -v %cd%/src:/app/src:ro --env-file ./.env express-node-add`


for docker compose:

environment:
- PORT=4400
- NODE_ENV=development
- HOPA=DEVOPS
env_file:
    - ./.env

----

### Docker Hot reload

adding  G:\Devops_Hopa\Docker\npm_app:\app makes the files and directories synced, 
but if 
- a new files is created inside of the container, it will be created on the Host
- a process inside the container removed a file, it will be removed from the Host
ex:
- `docker run --name express-node-app-container -d -p 4400:4000 -v G:\Devops_Hopa\Docker\npm_app:\app   express-node-add   >> -v sync volums`

to overcome the creation of new files in the container, I can add ro(readonly)
`G:/Devops_Hopa/Docker/npm_app:/app:ro`

ex:
- `docker run --name express-node-app-container -d -p 4400:4000 -v G:/Devops_Hopa/Docker/npm_app:/app:ro   express-node-add  >> read only`

in order to prevent the deletion of any file we can add anonomous volum
ex:
- `anonomous volum  >> -v /app/node_modules`


## Docker Compose




### Docker in more than 1 env


- docker compose -f docker-compose.prod.yml up -d


- compose -f docker-compose.prod.yml down 


- best practive is to create a compose file for each env, with 1 componse for common
ex:
`docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`


### Multi staged docker file

`RUN if [ $NODE_ENV = "production" ]; \
then npm install --only=production; \
else npm install; \
fi`

- CMD can be overwrite using command in compose


- in docker file:

RUN if [ $NODE_ENV = "production" ]; \
then npm install --only=production; \
else npm install; \
fi



OR
- staging

```
FROM node:20 as base
FROM base as development
FROM base as production
```




-----
## Extra Notes:


### What is nginx

### what is redis