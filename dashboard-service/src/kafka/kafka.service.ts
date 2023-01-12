import { OnApplicationShutdown } from "@nestjs/common";
import { Kafka, Consumer, ConsumerConfig, ConsumerSubscribeTopics, Message } from "kafkajs";
import { KAFKA_CLIENT_ID } from "src/constants";


export type KafkaConsumerOpts = {
    topic: ConsumerSubscribeTopics,
    config: ConsumerConfig,
    onMessages: (msgs: Message[]) => Promise<void>
}

export class KafkaService implements OnApplicationShutdown {
    private readonly client: Kafka
    private readonly consumers: Consumer[] = []

    async onApplicationShutdown() {
        await Promise.all(this.consumers.map(c => c.disconnect()))
    }

    constructor() {
        this.client = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: [process.env.KAFKA_BROKER || '127.0.0.1:9092'],
            retry: { retries: 5 },
        });
    }

    async consume({ topic, config, onMessages }: KafkaConsumerOpts): Promise<void> {
        const consumer = this.client.consumer(config)

        await consumer.connect()
        await consumer.subscribe(topic)
        await consumer.run({
            partitionsConsumedConcurrently: 3,
            eachBatch: async ({ batch }) => {
                onMessages(batch.messages)
            },
        })

        this.consumers.push(consumer)
    }
}