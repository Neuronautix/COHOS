import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

export async function createApiApp() {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = (process.env.COHOS_WEB_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin:
      configuredOrigins.length > 0
        ? configuredOrigins
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  return app;
}
