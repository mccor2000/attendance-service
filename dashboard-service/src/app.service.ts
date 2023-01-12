import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HIGH_FEVER_TEMPERATURE, KAFKA_GROUP_ID, KAFKA_SERVICE, KAFKA_TOPIC } from './constants';
import { KafkaService } from './kafka/kafka.service';
import { DLQ, DLQDocument } from './schemas/dlq.schema';
import { Report, ReportDocument } from './schemas/report.schema';
import { Attendance, AttendanceDocument, AttendanceType } from './schemas/attendances.schema';

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
        rebalanceTimeout: 5000,
        retry: {
          retries: 10,
          initialRetryTime: 3000
        }
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

  async addToDLQ(attds: any[]) {
    await this.dqlModel.bulkWrite(attds.map(attd => ({
      insertOne: { document: attd }
    })))
  }

  upsertAttendancesQuery(attds: {
    userId: string,
    type: AttendanceType,
    timestamp: number,
    temperature: number,
    image: string,
  }[]): Array<any> {
    return attds.map(({ userId, type, timestamp, temperature, image }) => ({
      updateOne: {
        filter: {
          _id: userId,
          date: `${new Date(timestamp).toLocaleDateString()}Z`
        },
        update: {
          '$set': {
            [type]: { timestamp, temperature, image }
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
            "totalCheckIns": type === AttendanceType.CHECKIN ? 1 : 0,
            "totalCheckOuts": type === AttendanceType.CHECKOUT ? 1 : 0,
            "totalFeversDetect": temperature >= HIGH_FEVER_TEMPERATURE ? 1 : 0,
          }
        },
        upsert: true
      }
    }))
  }
}
