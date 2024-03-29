import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Attendance, AttendanceSchema } from './schemas/attendances.schema';
import { Report, ReportSchema } from './schemas/report.schema';
import { DLQ, DLQSchema } from './schemas/dlq.schema';

import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
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
