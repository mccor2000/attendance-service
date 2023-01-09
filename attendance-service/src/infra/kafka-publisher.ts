import { CompressionTypes, Message, Producer } from "kafkajs";

import { IPublisher } from "../core/ports";
import { Bulk } from "../utils/bulk";
import { KAFKA_TOPIC } from "../utils/constants";


export class KafkaPublisher implements IPublisher {
    private bulk: Bulk<Message>

    constructor(private readonly kafka: Producer) {
        this.bulk = new Bulk(
            3000, 
            5 * 1000, 
            this.publish.bind(this)
        )
    }

    async produce(message: any) {
        this.bulk.push({ value: message })
    }

    async publish(batch: Message[]) {
        await this.kafka.send({
            topic: KAFKA_TOPIC,
            compression: CompressionTypes.GZIP,
            messages: batch
        })
    }
}