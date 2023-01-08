import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { School, SchoolDocument } from './models/school.schema';
import { User, UserDocument } from './models/user.schema';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(School.name)
    private readonly schoolModel: Model<SchoolDocument>,
    @Inject('KAFKA_SERVICE')
    private readonly kafka: KafkaService
  ) { }


  async onModuleInit() {
    await this.kafka.consume({
      topic: { topics: ['attendance'] },
      config: {
        groupId: 'attendance-consumer',
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
                  attendances: {
                    timestamp: attd.timestamp,
                    temperature: attd.temperature,
                    image: attd.image
                  }
                }
              },
              upsert: true
            }
          })

          // schoolUpdates.push({
          //   updateOne: {
          //     filter: { _id: attd.schoolId },
          //     update: {
          //       '$addToSet': {
          //         reports: {
          //           timestamp: attd.timestamp,
          //           temperature: attd.temperature,
          //           image: attd.image
          //         }
          //       }
          //     },
          //     upsert: true
          //   }
          // })
        }

        this.userModel.bulkWrite(userUpdates)
        this.schoolModel.bulkWrite(schoolUpdates)
      }
    })
  }

  async

}
