import { FastifyInstance } from 'fastify';
import { Kafka, logLevel } from 'kafkajs';
import Redis from 'ioredis';
import fp from "fastify-plugin";
import jwt from '@fastify/jwt';

import { AttendanceRepo } from '../infra/redis-repo';
import { KafkaPublisher } from '../infra/kafka-publisher';
import { IRepo } from '../core/ports';
import { KAFKA_TOPIC } from '../utils/constants';

export const auth = fp(async (fastify: FastifyInstance, _opts) => {
    fastify.register(jwt, { secret: 'secret' })

    // fastify.addHook("onRequest", async (request, reply) => {
    //     try {
    //         await request.jwtVerify()
    //     } catch (err) {
    //         reply.send(err)
    //     }
    // })
})

export const publisher = fp(async (fastify: FastifyInstance, _opts) => {
    const client = new Kafka({
        clientId: 'attendance-service',
        brokers: ['127.0.0.1:9092'],
        retry: {
            initialRetryTime: 100,
            retries: 8
        },
        logLevel: logLevel.INFO
    })

    const admin = client.admin()
    await admin.connect()
    const topics = await admin.listTopics()
    if (!topics.includes(KAFKA_TOPIC)) {
        await admin.createTopics({
            waitForLeaders: true,
            topics: [{
                topic: KAFKA_TOPIC,
                numPartitions: 3
            }]
        })
    }
    await admin.disconnect()

    const producer = client.producer({
        allowAutoTopicCreation: false,
        transactionTimeout: 30000
    })
    await producer.connect()

    fastify.decorate('publisher', new KafkaPublisher(producer))
})

export const repo = fp(async (fastify: FastifyInstance, _opts) => {
    const client = new Redis({ host: 'localhost', port: 6379 })
    const repo = new AttendanceRepo(client)

    fastify.addHook('onClose', (_fastify, done) => {
        client.disconnect()
        done()
    })

    fastify.decorate<IRepo>('repo', repo)
})