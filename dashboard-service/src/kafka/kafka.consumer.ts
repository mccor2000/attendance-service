import { Logger } from "@nestjs/common";
import { Consumer, ConsumerConfig, ConsumerSubscribeTopics, Kafka, Message } from "kafkajs";


export class KafkaConsumer {
    private readonly client: Kafka
    private readonly consumer: Consumer
    private readonly logger: Logger

    constructor(
        private readonly topic: ConsumerSubscribeTopics,
        config: ConsumerConfig,
        broker: string,
    ) {
        this.client = new Kafka({ 
            clientId: 'dashboard-service',
            brokers: [broker],
            retry: {
                initialRetryTime: 100,
                retries: 8
            }
        });
        this.consumer = this.client.consumer(config)
        this.logger = new Logger(`${topic.topics}-${config.groupId}`)
    }

    async connect(): Promise<void> {
        await this.consumer.connect()
    };

    async disconnect(): Promise<void> {
        await this.consumer.disconnect()
    }

    async consume(onMessage: (msg: Message[]) => Promise<void>): Promise<void> {
        console.log('here')
        await this.consumer.subscribe(this.topic);
        await this.consumer.run({
            eachBatch: async ({ batch }) => {
                this.logger.debug(`Processing message partition ${batch.partition}`)
                try {
                    await onMessage(batch.messages) 
                } catch (err) {
                    this.logger.error('Error consuming message. Adding to DLQ...', err)
                    await this.addMessageToDLQ(batch.messages)
                }
            }
        })
    }

    private async addMessageToDLQ(msgs: Message[]) {
        console.log('adding message to DLQ - Mongodb')
    }
}