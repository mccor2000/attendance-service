## What is this service?
This service is used for persist and query attendances data.

## Technical stack
 - [Nestjs](https://www.fastify.io) for backend framework
 - [MongoDB](https://redis.io) for database
 - [Kafka](https://kafka.apache.org) for message broker

## Architecture
This application using the convention architecture of Nestjs (modular)
 - [/schemas](./src/schemas/) : Define mongo collection schemas.
 - [/dashboard](./src/dashboard/) : APIs for dashboard (draft).
 - [/kafka](./src/kafka) :  Generic Kafka module, provide services for dealing with kafka consumer.
 - [/app.service.ts](./src/app.service.ts) : This is where the app register and consume message from kafka.  

## Concerns
 - Consuming Kafka and bulk write to MongoDB could take a long time, this could result in [kafka consumer lag](https://www.acceldata.io/blog/understanding-lag-in-kafka-cluster)
 - 10 million records a day seems costly, consider another type of nosql db, e.g: timeseries 
 - A better Dead Letter Queue mechanism

## Run in local development
```
$ yarn start:dev
```