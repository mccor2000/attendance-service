import { Injectable } from "@nestjs/common";
import { Consumer, ConsumerConfig, ConsumerSubscribeTopics, Kafka, Message } from "kafkajs";
import { KAFKA_CLIENT_ID } from "src/constants";


@Injectable()
export class KafkaConsumer {
    private readonly client: Kafka
    private readonly consumer: Consumer

    constructor(
        private readonly topic: ConsumerSubscribeTopics,
        config: ConsumerConfig,
        broker: string,
    ) {
        this.client = new Kafka({
            clientId: KAFKA_CLIENT_ID,
            brokers: [broker],
            retry: { retries: 5 },
        });
        this.consumer = this.client.consumer(config)
    }

    async connect(): Promise<void> {
        await this.consumer.connect()
    };

    async disconnect(): Promise<void> {
        await this.consumer.disconnect()
    }

    async consume(onMessage: (msg: Message[]) => Promise<void>): Promise<void> {
        await this.consumer.subscribe(this.topic);
        await this.consumer.run({
            partitionsConsumedConcurrently: 3,
            eachBatch: async ({ batch }) => {
                onMessage(batch.messages)
            },
        })
    }
}