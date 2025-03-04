FROM node:22-slim AS base

WORKDIR /app

COPY . .
RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 3000
CMD ["yarn", "start:prod"]
