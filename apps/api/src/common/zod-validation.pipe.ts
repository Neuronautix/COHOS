import { BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: z.ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        error: 'Bad Request',
        issues: result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
        message: 'Request validation failed',
      });
    }

    return result.data;
  }
}
