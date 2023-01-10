FROM node:16-alpine AS base

WORKDIR /usr/app

COPY package.json yarn.lock ./

# -------------------------------
FROM base AS build

RUN yarn install

COPY . .

RUN yarn build

# -------------------------------
FROM base AS run

ENV NODE_ENV=prod

RUN yarn install --production

COPY --from=build /usr/app/dist ./dist

CMD ["node", "dist/main.js"]