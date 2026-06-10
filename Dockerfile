FROM node:20 as base

WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
ENV PORT=4000
EXPOSE $PORT
CMD ["npm", "run", "start-dev"]




FROM base as development

WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app
ENV PORT=4000
EXPOSE $PORT
CMD ["npm", "run", "start-dev"]



FROM base as production

WORKDIR /app
COPY package.json /app/
RUN npm install --only=production
COPY . /app
ENV PORT=4000
EXPOSE $PORT
CMD ["npm", "start"]









# FROM node:20


# WORKDIR /app

# COPY package.json /app/


# ARG NODE_ENV

# RUN if [ $NODE_ENV = "production" ]; \
# then npm install --only=production; \
# else npm install; \
# fi

# COPY . /app

# ENV PORT=4000

# EXPOSE $PORT