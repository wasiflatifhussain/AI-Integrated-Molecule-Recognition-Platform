# FROM node:19.6-alpine

# WORKDIR /usr/src/app

# ENV NODE_ENV production

# COPY package*.json ./

# RUN npm install --force

# USER node

# COPY  --chown=node:node . .

# EXPOSE 3000

# CMD ["node", "./src/index.js"]

# syntax=docker/dockerfile:1.5

FROM node:19.4-bullseye AS build 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build

# Use separate stage for deployable image
FROM nginxinc/nginx-unprivileged:1.23-alpine-perl

# Use COPY --link to avoid breaking cache if we change the second stage base image
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /usr/src/app/build/ /usr/share/nginx/html

EXPOSE 3000