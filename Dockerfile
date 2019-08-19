FROM node:10.15.3
ARG DB_CONNECTION

ADD . /app
WORKDIR /app

RUN npm install
RUN npm run build

EXPOSE 3000
VOLUME /app
