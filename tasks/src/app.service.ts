import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import * as AsyncRetry from 'async-retry';
import Redis from 'ioredis';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger('Tasks')

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectConnection()
    private readonly mongo: Connection
  ) { }

  // every hours from Monday to Friday
  @Cron('0 0 * * * 1-5')
  async processDeadLetterQueue(): Promise<void> {
    try {
      await AsyncRetry(
        async () => {
          const attendances = await this.mongo.collection('dlq').find().toArray()
          this.logger.log(`Process ${attendances.length} attendances in DLQ...`)

          await Promise.all([
            this.mongo.collection('attendances').bulkWrite(this.upsertAttendancesQuery(attendances)),
            this.mongo.collection('reports').bulkWrite(this.upsertReportsQuery(attendances))
          ])
        }, {
        onRetry: (err, attempt) => {
          this.logger.error(`Error processing DLQ, executing retry ${attempt}/3`, err)
        },
        retries: 3,
      })
    } catch (err) {
      this.logger.error('Error process DLQ: ', err)
      // further operations. e.g: emailing,..
    }
  }

  // everyday 
  @Cron('0 0 0 * * *')
  async flushRedis(): Promise<void> {
    try {
      await AsyncRetry(
        async () => {
          await this.redis.flushall()
          this.logger.log('Redis flushed.')
        }, {
        onRetry: (err, attempt) => {
          this.logger.error(`Error flushing redis, executing retry ${attempt}/3`, err)
        },
        retries: 3,
      })
    } catch (err) {
      this.logger.error('Error flushing redis: ', err)
      // further operations. e.g: emailing,..
    }
  }

  upsertAttendancesQuery(attds: any[]) {
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

  upsertReportsQuery(attds: any[]): Array<any> {
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
}
