FROM node:14.17-alpine3.14
LABEL org.opencontainers.image.authors="A-styler@ya.ru"
LABEL org.opencontainers.image.source="https://github.com/bbalkonsky/travel-parser-js.git"

WORKDIR /app
ADD . /app

RUN npm i \
    && npm prune --production

EXPOSE 3000
ENTRYPOINT npm start