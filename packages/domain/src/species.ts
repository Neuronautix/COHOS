import { z } from 'zod';

import { entityIdSchema, ncbiTaxonIdSchema } from './primitives.js';

export const speciesSchema = z.strictObject({
  id: entityIdSchema,
  commonName: z.string().trim().min(1),
  scientificName: z.string().trim().min(1),
  ncbiTaxonId: ncbiTaxonIdSchema.optional(),
});

export const animalSpeciesSchema = speciesSchema.extend({
  ncbiTaxonId: ncbiTaxonIdSchema,
});

export type Species = z.infer<typeof speciesSchema>;
export type AnimalSpecies = z.infer<typeof animalSpeciesSchema>;
