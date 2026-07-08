import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

const DEFAULT_PORT = 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configuredPort = Number.parseInt(process.env.PORT ?? '', 10);
  const port = Number.isNaN(configuredPort) ? DEFAULT_PORT : configuredPort;

  await app.listen(port);
}

void bootstrap();
