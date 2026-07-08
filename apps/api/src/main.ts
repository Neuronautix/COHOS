import 'reflect-metadata';

import { createApiApp } from './app.factory.js';

const DEFAULT_PORT = 3001;

async function bootstrap() {
  const app = await createApiApp();
  const configuredPort = Number.parseInt(process.env.PORT ?? '', 10);
  const port = Number.isNaN(configuredPort) ? DEFAULT_PORT : configuredPort;

  await app.listen(port);
}

void bootstrap();
