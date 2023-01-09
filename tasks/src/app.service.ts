import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import AsyncRetry from 'async-retry';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger('Tasks')

  constructor(
    @InjectRedis()
    private readonly redis: Redis
  ) { }

  @Cron('0 0 0 * * *')
  async flushRedis(): Promise<void> {
    try {
      await AsyncRetry(
        async () => { 
          await this.redis.flushall()
        }, {
        onRetry: (err, attempt) => {
          this.logger.error(`Error flushing redis, executing retry ${attempt}/3`, err)
        },
        retries: 3, 
      })
    } catch (err) {
      this.logger.error('Error flushing redis: ', err)
    }
  }

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
    }
  }
}
