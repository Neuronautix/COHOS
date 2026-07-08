import { Injectable } from '@nestjs/common';

export type HealthResponse = {
  readonly service: 'cohos-api';
  readonly status: 'ok';
  readonly timestamp: string;
  readonly version: string;
};

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return {
      service: 'cohos-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }
}
