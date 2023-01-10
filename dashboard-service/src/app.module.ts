import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { School, SchoolSchema } from './models/school.schema';
import { User, UserSchema } from './models/user.schema';
import { DLQ, DLQSchema } from './models/dlq.schema';

import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Report, ReportSchema } from './models/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
      { name: Report.name, schema: ReportSchema },
      { name: DLQ.name, schema: DLQSchema },
    ]),
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://localhost:27017'),
    KafkaModule,
    DashboardModule,
  ],
  providers: [AppService],
})
export class AppModule { }
