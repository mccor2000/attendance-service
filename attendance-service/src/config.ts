import { logLevel } from "kafkajs";
import { KAFKA_CLIENT_ID } from "./constants";

export default {
    server: {
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT ? parseInt(process.env.PORT) : 8080 
    },
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379
    },
    kafka: {
        client: {
            clientId: KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
            logLevel: logLevel.INFO,
        },
        producer: {
            allowAutoTopicCreation: false,
            retry: {
                retries: 10,
                initialRetryTime: 3000
            },
        }
    }
}