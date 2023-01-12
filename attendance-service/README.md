## What is this service?
This service is used for Check-in/Check-out operations.
> Note: It does not provide functionality for read-operations (e.g: query, report,..). For such features, kindly take a look at [dashboard-service](../dashboard-service)

## Technical stack
 - [Fastify](https://www.fastify.io) for backend framework
 - [Redis](https://redis.io) for database
 - [Kafka](https://kafka.apache.org) for message broker

## Architecture
This application is build using the [Hexagonal architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) (a.k.a Ports & Adapters)
 - [/app](./src/app) :  Application/Representation layer (framework)
 - [/core](./src/core) : Include domain entity, business logic, interfaces(ports) 
 - [/infra](./src/infra) : Provide infrastructures for database access, event publisher.

## Run in local development
```
$ yarn dev
```
## Test
```
$ yarn test
```