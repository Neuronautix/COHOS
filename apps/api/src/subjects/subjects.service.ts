import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { type SubjectWithProfile, subjectWithProfileSchema } from '@cohos/domain';

import type { CreateSubjectDto } from './dto.js';
import { subjectFixtures } from './subject.fixtures.js';

@Injectable()
export class SubjectsService {
  private readonly subjects = new Map<string, SubjectWithProfile>(
    subjectFixtures.map((subject) => [subject.id, subject]),
  );

  listSubjects(): SubjectWithProfile[] {
    return Array.from(this.subjects.values());
  }

  getSubject(subjectId: string): SubjectWithProfile {
    const subject = this.subjects.get(subjectId);

    if (subject === undefined) {
      throw new NotFoundException(`Subject ${subjectId} was not found.`);
    }

    return subject;
  }

  createSubject(input: CreateSubjectDto): SubjectWithProfile {
    const subject = subjectWithProfileSchema.parse({
      ...input,
      id: `subject-${randomUUID()}`,
    });

    this.subjects.set(subject.id, subject);

    return subject;
  }
}
