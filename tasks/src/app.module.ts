import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule.forRoot({ config: { url: 'redis://localhost:6379'}})
  ],
  providers: [AppService],
})
export class AppModule {}
