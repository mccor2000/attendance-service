import "dotenv/config"
import { NestFactory } from '@nestjs/core';
import helmet from "helmet";
import * as compression from 'compression'

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: "*" })
  app.use(helmet())
  app.use(compression())

  const PORT = process.env.PORT ? process.env.PORT : 8081
  await app.listen(PORT, '0.0.0.0')
}
bootstrap();
