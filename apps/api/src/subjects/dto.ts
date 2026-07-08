import {
  entityIdSchema,
  subjectProfileSchema,
  subjectProfileTypeSchema,
  subjectStatusSchema,
} from '@cohos/domain';
import { z } from 'zod';

export const createSubjectSchema = z
  .strictObject({
    organizationId: entityIdSchema,
    subjectCode: z.string().trim().min(1),
    profileType: subjectProfileTypeSchema,
    status: subjectStatusSchema.default('active'),
    cohortId: entityIdSchema.optional(),
    speciesId: entityIdSchema.optional(),
    profile: subjectProfileSchema,
  })
  .refine((subject) => subject.profileType === subject.profile.profileType, {
    message: 'Subject profile type must match the embedded profile type',
    path: ['profileType'],
  })
  .superRefine((subject, context) => {
    if (
      subject.profile.profileType === 'human' &&
      subject.subjectCode !== subject.profile.pseudonymizedSubjectCode
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Human subject code must match the pseudonymized subject code',
        path: ['subjectCode'],
      });
    }
  });

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;
