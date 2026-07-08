import { env } from 'node:process';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env.DATABASE_URL ?? 'postgresql://cohos:cohos@localhost:5432/cohos_dev',
  },
  migrations: {
    seed: 'tsx src/seed.ts',
  },
});
