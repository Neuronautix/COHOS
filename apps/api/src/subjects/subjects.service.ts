import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import {
  type SubjectAggregate,
  type SubjectAggregateMembership,
  type SubjectWithProfile,
  subjectWithProfileSchema,
} from '@cohos/domain';

import type { CreateSubjectDto } from './dto.js';
import {
  subjectAggregateFixtures,
  subjectAggregateMembershipFixtures,
  subjectFixtures,
} from './subject.fixtures.js';

@Injectable()
export class SubjectsService {
  private readonly subjects = new Map<string, SubjectWithProfile>(
    subjectFixtures.map((subject) => [subject.id, subject]),
  );

  private readonly subjectAggregates = new Map<string, SubjectAggregate>(
    subjectAggregateFixtures.map((aggregate) => [aggregate.id, aggregate]),
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

  listSubjectAggregates(): SubjectAggregate[] {
    return Array.from(this.subjectAggregates.values());
  }

  getSubjectAggregate(aggregateId: string): SubjectAggregate {
    const aggregate = this.subjectAggregates.get(aggregateId);

    if (aggregate === undefined) {
      throw new NotFoundException(`Subject aggregate ${aggregateId} was not found.`);
    }

    return aggregate;
  }

  listSubjectAggregateMemberships(aggregateId: string): SubjectAggregateMembership[] {
    this.getSubjectAggregate(aggregateId);

    return subjectAggregateMembershipFixtures.filter(
      (membership) => membership.aggregateId === aggregateId,
    );
  }

  listSubjectMemberships(subjectId: string): SubjectAggregateMembership[] {
    this.getSubject(subjectId);

    return subjectAggregateMembershipFixtures.filter(
      (membership) => membership.subjectId === subjectId,
    );
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
