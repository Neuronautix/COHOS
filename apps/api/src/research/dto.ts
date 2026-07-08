import { assaySchema, investigationSchema, procedureSchema, studySchema } from '@cohos/domain';
import type { z } from 'zod';

export const createInvestigationSchema = investigationSchema.omit({ id: true });
export const createStudySchema = studySchema.omit({ id: true });
export const createAssaySchema = assaySchema.omit({ id: true });
export const createProcedureSchema = procedureSchema.omit({ id: true });

export type CreateInvestigationDto = z.infer<typeof createInvestigationSchema>;
export type CreateStudyDto = z.infer<typeof createStudySchema>;
export type CreateAssayDto = z.infer<typeof createAssaySchema>;
export type CreateProcedureDto = z.infer<typeof createProcedureSchema>;
