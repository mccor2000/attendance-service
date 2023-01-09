import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { School, SchoolSchema } from './models/school.schema';
import { User, UserSchema } from './models/user.schema';
import { DLQ, DLQSchema } from './models/dlq.schema';

import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: School.name, schema: SchoolSchema },
      { name: DLQ.name, schema: DLQSchema },
    ]),
    MongooseModule.forRoot('mongodb://mccorby:mccorby@localhost:27017'),
    KafkaModule,
  ],
  providers: [AppService],
})
export class AppModule { }
