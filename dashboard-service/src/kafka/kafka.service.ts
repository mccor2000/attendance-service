import { OnApplicationShutdown } from "@nestjs/common";
import { ConsumerConfig, ConsumerSubscribeTopics, Message } from "kafkajs";
import { KafkaConsumer } from "./kafka.consumer";


export type KafkaConsumerOpts = {
    topic: ConsumerSubscribeTopics,
    config: ConsumerConfig,
    onMessages: (msgs: Message[]) => Promise<void>
}


export class KafkaService implements OnApplicationShutdown {
    private readonly consumers: KafkaConsumer[] = []

    async onApplicationShutdown(signal?: string) {
        await Promise.all(this.consumers.map(c => c.disconnect()))
    }

    async consume({ topic, config, onMessages }: KafkaConsumerOpts ): Promise<void> {
        const consumer = new KafkaConsumer(topic, config, "127.0.0.1:9092")

        await consumer.connect()
        await consumer.consume(onMessages)
        this.consumers.push(consumer)
    }
}