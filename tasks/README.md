## What is this service?
This contain cron-jobs for asynchronous processing.

## Technical stack
 - [Nestjs](https://www.fastify.io) as a standalone application

## Tasks
This application using the convention architecture of Nestjs (modular)
 - Flush redis
 - Process DLQ

## Run in local development
```
$ yarn start:dev
```

## Concerns
 - Timezone