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

  // 0:0 every day
  @Cron('0 0 0 * * *')
  async processDeadLetterQueue(): Promise<void> {
    try {
      await AsyncRetry(
        async () => {
          // TODO:
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
}
