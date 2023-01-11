import { FastifyInstance } from 'fastify';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import fp from "fastify-plugin";
import jwt from '@fastify/jwt';

import { AttendanceRepo } from '../infra/redis-repo';
import { KafkaPublisher } from '../infra/kafka-publisher';
import { KAFKA_TOPIC } from '../constants';
import config from '../config';

export const auth = fp(async (fastify: FastifyInstance, _opts) => {
    fastify.register(jwt, { secret: 'secret' })

    fastify.addHook("onRequest", async (request, reply) => {
        try {
            await request.jwtVerify()
        } catch (err) {
            reply.send(err)
        }
    })
})

export const publisher = fp(async (fastify: FastifyInstance, _opts) => {
    const client = new Kafka(config.kafka.client)

    await createKafkaTopic(client)

    const producer = client.producer(config.kafka.producer)
    await producer.connect()

    fastify.decorate('publisher', new KafkaPublisher(producer))
})

export const repo = fp(async (fastify: FastifyInstance, _opts) => {
    const client = new Redis(config.redis)

    fastify.addHook('onClose', (_fastify, done) => {
        client.disconnect()
        done()
    })
    fastify.decorate('repo', new AttendanceRepo(client))
})


const createKafkaTopic = async (client: Kafka): Promise<void> => {
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
}