import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule.forRoot({ config: { url: process.env.REDIS_URL || 'redis://localhost:6379'}}),
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost:27017')
  ],
  providers: [AppService],
})
export class AppModule {}
