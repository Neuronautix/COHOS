import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  alertSchema,
  auditEventSchema,
  connectedResourceLinkSchema,
  connectorCredentialSchema,
  eventSchema,
  qrTokenSchema,
  speciesSchema,
  subjectWithProfileSchema,
} from '@cohos/domain';
import { describe, expect, it } from 'vitest';

import { syntheticSeedData } from './seed-data.js';

const repoRoot = join(import.meta.dirname, '../../..');

function collectFiles(directory: string): string[] {
  const ignored = new Set(['.git', 'node_modules', 'dist', '.next', 'generated']);
  const files: string[] = [];

  for (const entry of readdirSync(directory)) {
    if (ignored.has(entry)) {
      continue;
    }

    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      files.push(...collectFiles(path));
    } else {
      files.push(path);
    }
  }

  return files;
}

describe('synthetic seed data', () => {
  it('validates subject profile fixtures through domain schemas', () => {
    for (const subject of syntheticSeedData.subjects) {
      expect(subjectWithProfileSchema.safeParse(subject).success).toBe(true);
    }
  });

  it('keeps human participant fixtures pseudonymized', () => {
    const humanSubjects = syntheticSeedData.subjects.filter(
      (subject) => subject.profile.profileType === 'human',
    );
    const disallowedKeys = [
      'email',
      'phone',
      'address',
      'fullName',
      'dateOfBirth',
      'medicalRecord',
    ];

    expect(humanSubjects).toHaveLength(1);

    for (const subject of humanSubjects) {
      expect(subject.subjectCode).toMatch(/^HUM-PSEUDO-/);

      for (const key of disallowedKeys) {
        expect(Object.hasOwn(subject.profile, key)).toBe(false);
      }
    }
  });

  it('validates species, event, audit, connector, alert, and QR fixtures', () => {
    for (const species of syntheticSeedData.species) {
      const domainSpecies = {
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        ncbiTaxonId: species.ncbiTaxonId,
      };

      expect(speciesSchema.safeParse(domainSpecies).success).toBe(true);
    }

    for (const event of syntheticSeedData.events) {
      expect(eventSchema.safeParse(event).success).toBe(true);
    }

    for (const auditEvent of syntheticSeedData.auditEvents) {
      const parsed = auditEventSchema.parse(auditEvent);
      expect(parsed.newValue?.redacted).toBe(true);
    }

    for (const alert of syntheticSeedData.alerts) {
      expect(alertSchema.safeParse(alert).success).toBe(true);
    }

    for (const link of syntheticSeedData.connectedResourceLinks) {
      expect(connectedResourceLinkSchema.safeParse(link).success).toBe(true);
      expect(link.url).toContain('example.test');
    }

    for (const credential of syntheticSeedData.connectorCredentials) {
      expect(connectorCredentialSchema.safeParse(credential).success).toBe(true);
      expect(credential.credentialReference).toMatch(/^secret:\/\//);
    }

    for (const token of syntheticSeedData.qrTokens) {
      expect(qrTokenSchema.safeParse(token).success).toBe(true);
      expect(Date.parse(token.expiresAt)).toBeGreaterThan(Date.parse(token.createdAt));
    }
  });

  it('does not contain forbidden legacy names in repository files', () => {
    const terms = [`${'ZE'}${'TA'}`, `${'Ze'}${'fix'}`];
    const matches = collectFiles(repoRoot).flatMap((file) => {
      const content = readFileSync(file, 'utf8');

      return terms
        .filter((term) => content.includes(term))
        .map((term) => ({
          file,
          term,
        }));
    });

    expect(matches).toEqual([]);
  });
});
