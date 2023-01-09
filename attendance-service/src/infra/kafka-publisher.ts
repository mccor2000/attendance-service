import { CompressionTypes, Producer } from "kafkajs";

import { IPublisher } from "../core/ports";
import { KAFKA_TOPIC } from "../utils/constants";


export class KafkaPublisher implements IPublisher {
    private messagePool: { value: any }[]

    constructor(private readonly kafka: Producer) {
        this.messagePool = []
    }

    async produce(message: any) {
        this.messagePool.push({ value: message })
        if (this.messagePool.length === 1000) {
            this.publish()
            this.messagePool = []
        }
    }

    async publish() {
        await this.kafka.send({
            topic: KAFKA_TOPIC,
            compression: CompressionTypes.GZIP,
            messages: this.messagePool
        })
    }
}