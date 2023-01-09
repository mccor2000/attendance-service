import { Module } from "@nestjs/common";
import { KAFKA_SERVICE } from "src/constants";
import { KafkaService } from "./kafka.service";

@Module({
    providers: [
        {
            provide: KAFKA_SERVICE,
            useClass: KafkaService
        },
    ],
    exports: [
        {
            provide: KAFKA_SERVICE,
            useClass: KafkaService
        }
    ]
})
export class KafkaModule { }