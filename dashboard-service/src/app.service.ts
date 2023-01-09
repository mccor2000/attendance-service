import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { KafkaService } from './kafka/kafka.service';
import { School, SchoolDocument } from './models/school.schema';
import { User, UserDocument } from './models/user.schema';
import { DLQ, DLQDocument } from './models/dlq.schema';
import { KAFKA_GROUP_ID, KAFKA_SERVICE, KAFKA_TOPIC } from './constants';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger: Logger = new Logger(AppService.name)

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
    @InjectModel(DLQ.name)
    private readonly dqlModel: Model<DLQDocument>,
    @Inject(KAFKA_SERVICE)
    private readonly kafka: KafkaService
  ) { }


  async onModuleInit() {
    await this.kafka.consume({
      topic: { topics: [KAFKA_TOPIC] },
      config: {
        groupId: KAFKA_GROUP_ID,
        rebalanceTimeout: 1000
      },
      onMessages: async (batch): Promise<void> => {
        const attendances = batch.map((msg) => JSON.parse(msg.value as string))

        const userUpdates = []
        const schoolUpdates = []

        for (let i = 0; i < attendances.length; i++) {
          const attd = attendances[i]

          userUpdates.push({
            updateOne: {
              filter: { _id: attd.userId },
              update: {
                '$addToSet': {
                  'attendances': {
                    'timestamp': attd.timestamp,
                    'temperature': attd.temperature,
                    'image': attd.image
                  }
                }
              },
            }
          })

          schoolUpdates.push({
            updateOne: {
              filter: { _id: attd.schoolId },
              update: {
                '$inc': {
                  "liveReport.totalCheckIns": attd.type === 'checkin' ? 1 : 0,
                  "liveReport.totalCheckOuts": attd.type === 'checkout' ? 1 : 0,
                  "liveReport.totalFeversDetect": attd.temperature >= 38 ? 1 : 0,
                }
              },
            }
          })
        }

        try {
          await Promise.all([
            this.userModel.bulkWrite(userUpdates),
            this.schoolModel.bulkWrite(schoolUpdates)
          ])
        } catch (err) {
          this.logger.error('Error consuming message. Adding to DLQ...', err)
          await this.dqlModel.insertMany(batch)
        }
      }
    })
  }
}
