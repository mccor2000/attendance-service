import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { KAFKA_GROUP_ID, KAFKA_SERVICE, KAFKA_TOPIC } from './constants';
import { KafkaService } from './kafka/kafka.service';
import { DLQ, DLQDocument } from './models/dlq.schema';
import { Report, ReportDocument } from './models/report.schema';
import { Attendance, AttendanceDocument } from './models/attendances.schema';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger: Logger = new Logger(AppService.name)

  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Report.name)
    private readonly reportModel: Model<ReportDocument>,
    @InjectModel(DLQ.name)
    private readonly dqlModel: Model<DLQDocument>,
    @Inject(KAFKA_SERVICE)
    private readonly kafka: KafkaService
  ) { }


  async onModuleInit() {
    await this.kafka.consume({
      topic: { topics: [KAFKA_TOPIC] },
      config: {
        allowAutoTopicCreation: false,
        groupId: KAFKA_GROUP_ID,
      },
      onMessages: async (batch): Promise<void> => {
        const attendances = batch.map((msg) => JSON.parse(msg.value as string))
        this.logger.log(`Process ${attendances.length} attendances...`)

        try {
          await Promise.all([
            this.attendanceModel.bulkWrite(this.upsertAttendancesQuery(attendances)),
            this.reportModel.bulkWrite(this.upsertReportsQuery(attendances))
          ])
        } catch (err) {
          this.logger.log(`Error consuming message. Adding ${attendances.length} to DLQ...`)
          this.logger.error(err)
          this.addToDLQ(attendances)
        }
      }
    })
  }

  upsertAttendancesQuery(attds: {
    userId: string,
    type: string,
    timestamp: number,
    temperature: number,
    image: string,
  }[]): Array<any> {
    return attds.map(attd => ({
      updateOne: {
        filter: {
          _id: attd.userId,
          date: `${new Date(attd.timestamp).toLocaleDateString()}Z`
        },
        update: {
          '$set': {
            [attd.type]: {
              timestamp: attd.timestamp,
              temperature: attd.temperature,
              image: attd.image
            }
          }
        },
        upsert: true
      }
    }))
  }

  upsertReportsQuery(attds: {
    type: string,
    temperature: number,
    timestamp: number,
    schoolId: string,
  }[]): Array<any> {
    return attds.map(({ schoolId, timestamp, type, temperature }) => ({
      updateOne: {
        filter: {
          school: schoolId,
          date: `${new Date(timestamp).toLocaleDateString()}Z`
        },
        update: {
          '$inc': {
            "totalCheckIns": type === 'checkin' ? 1 : 0,
            "totalCheckOuts": type === 'checkout' ? 1 : 0,
            "totalFeversDetect": temperature >= 38 ? 1 : 0,
          }
        },
        upsert: true
      }
    }))
  }

  async addToDLQ(attds: any[]) {
    await this.dqlModel.bulkWrite(attds.map(attd => ({
      insertOne: { document: attd }
    })))
  }
}
