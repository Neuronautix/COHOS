import {
  subjectAggregateMembershipSchema,
  subjectAggregateSchema,
  type Alert,
  type AuditEvent,
  type ConnectorCredential,
  type ConnectedResourceLink,
  type EnvironmentalObservation,
  type HumanSubjectProfile,
  type MortalityEvent,
  type QRToken,
  type RodentSubjectProfile,
  type SubjectAggregate,
  type SubjectAggregateMembership,
  type SubjectWithProfile,
  type TransferEvent,
  type WelfareObservation,
  type ZebrafishBatchProfile,
} from '@cohos/domain';

export const seedNotice =
  'Synthetic COHOS development seed data. Human participant records are pseudonymized examples only.';

export const seedOrganization = {
  id: 'org-synthetic-cohos',
  name: 'COHOS Synthetic Research Organization',
  slug: 'cohos-synthetic',
};

export const seedRoles = [
  {
    id: 'role-operations-lead',
    organizationId: seedOrganization.id,
    name: 'Operations Lead',
    permissions: ['subjects:read', 'subjects:write', 'events:record'],
  },
  {
    id: 'role-reviewer',
    organizationId: seedOrganization.id,
    name: 'Reviewer',
    permissions: ['subjects:read', 'audit:read'],
  },
] as const;

export const seedUsers = [
  {
    id: 'user-seed-coordinator',
    organizationId: seedOrganization.id,
    displayName: 'Synthetic Coordinator',
    roleIds: ['role-operations-lead'],
  },
] as const;

export const seedSpecies = {
  mouse: {
    id: 'species-mus-musculus',
    organizationId: seedOrganization.id,
    commonName: 'house mouse',
    scientificName: 'Mus musculus',
    ncbiTaxonId: 'NCBITaxon:10090',
  },
  zebrafish: {
    id: 'species-danio-rerio',
    organizationId: seedOrganization.id,
    commonName: 'zebrafish',
    scientificName: 'Danio rerio',
    ncbiTaxonId: 'NCBITaxon:7955',
  },
  cattle: {
    id: 'species-bos-taurus',
    organizationId: seedOrganization.id,
    commonName: 'cattle',
    scientificName: 'Bos taurus',
    ncbiTaxonId: 'NCBITaxon:9913',
  },
  cellCulture: {
    id: 'species-cell-culture-generic',
    organizationId: seedOrganization.id,
    commonName: 'generic cell culture',
    scientificName: 'synthetic biological material',
    ncbiTaxonId: undefined,
  },
} as const;

const mouseProfileSpecies = {
  id: seedSpecies.mouse.id,
  commonName: seedSpecies.mouse.commonName,
  scientificName: seedSpecies.mouse.scientificName,
  ncbiTaxonId: seedSpecies.mouse.ncbiTaxonId,
};

const zebrafishProfileSpecies = {
  id: seedSpecies.zebrafish.id,
  commonName: seedSpecies.zebrafish.commonName,
  scientificName: seedSpecies.zebrafish.scientificName,
  ncbiTaxonId: seedSpecies.zebrafish.ncbiTaxonId,
};

const cattleProfileSpecies = {
  id: seedSpecies.cattle.id,
  commonName: seedSpecies.cattle.commonName,
  scientificName: seedSpecies.cattle.scientificName,
  ncbiTaxonId: seedSpecies.cattle.ncbiTaxonId,
};

const cellCultureProfileSpecies = {
  id: seedSpecies.cellCulture.id,
  commonName: seedSpecies.cellCulture.commonName,
  scientificName: seedSpecies.cellCulture.scientificName,
};

export const seedLines = [
  {
    id: 'line-zebrafish-synthetic-a',
    speciesId: seedSpecies.zebrafish.id,
    name: 'Synthetic zebrafish line A',
    description: 'Synthetic line for development fixtures.',
  },
] as const;

export const seedStrains = [
  {
    id: 'strain-mouse-synthetic-a',
    speciesId: seedSpecies.mouse.id,
    name: 'Synthetic mouse strain A',
    source: 'Synthetic fixture',
  },
] as const;

export const seedGenotypes = [
  {
    id: 'genotype-wildtype-synthetic',
    name: 'Synthetic wild type',
    description: 'Synthetic genotype placeholder for development.',
  },
] as const;

export const seedFacility = {
  id: 'facility-synthetic-main',
  organizationId: seedOrganization.id,
  name: 'Synthetic Main Facility',
  code: 'SMF',
};

export const seedRoom = {
  id: 'room-synthetic-a',
  facilityId: seedFacility.id,
  name: 'Synthetic Room A',
  code: 'A',
};

export const seedRack = {
  id: 'rack-synthetic-a1',
  roomId: seedRoom.id,
  name: 'Synthetic Rack A1',
  code: 'A1',
};

export const seedHousingUnits = {
  cage: {
    id: 'housing-cage-a1',
    roomId: seedRoom.id,
    rackId: seedRack.id,
    type: 'cage',
    name: 'Synthetic Cage A1',
    code: 'CAGE-A1',
  },
  tank: {
    id: 'housing-tank-z1',
    roomId: seedRoom.id,
    rackId: seedRack.id,
    type: 'tank',
    name: 'Synthetic Tank Z1',
    code: 'TANK-Z1',
  },
  pasture: {
    id: 'housing-pasture-f1',
    roomId: seedRoom.id,
    type: 'pasture',
    name: 'Synthetic Pasture F1',
    code: 'PASTURE-F1',
  },
} as const;

const humanProfile = {
  profileType: 'human',
  pseudonymizedSubjectCode: 'HUM-PSEUDO-001',
  consentStatus: 'consented',
  studyParticipationStatus: 'enrolled',
  ageBand: '40-49',
  sex: 'not_recorded',
  genderIdentity: 'prefer_not_to_say',
} satisfies HumanSubjectProfile;

const rodentProfile = {
  profileType: 'rodent',
  species: mouseProfileSpecies,
  strainId: seedStrains[0].id,
  genotypeId: seedGenotypes[0].id,
  sex: 'female',
  ageDays: 84,
  housingUnitId: seedHousingUnits.cage.id,
  welfareStatus: 'normal',
} satisfies RodentSubjectProfile;

const zebrafishProfile = {
  profileType: 'zebrafish_batch',
  species: zebrafishProfileSpecies,
  batchIdentifier: 'ZFB-SYN-001',
  lineId: seedLines[0].id,
  genotypeId: seedGenotypes[0].id,
  developmentalStage: 'larva',
  tankId: seedHousingUnits.tank.id,
  count: 120,
  mortalityEventIds: [],
  environmentalObservationIds: ['event-env-zebrafish-1'],
} satisfies ZebrafishBatchProfile;

export const seedSubjectAggregates = [
  {
    id: 'cohort-human-observational-001',
    organizationId: seedOrganization.id,
    kind: 'cohort',
    code: 'COHORT-HUM-OBS-001',
    name: 'Synthetic pseudonymized human observational cohort',
    description: 'Pseudonymized human participant cohort fixture.',
    profileTypes: ['human'],
    status: 'active',
    validFrom: '2026-01-01',
    subjectIds: ['subject-human-pseudo-001'],
    cohort: {
      cohortKind: 'observational',
      studyId: 'study-synthetic-001',
      inclusionCriteria: ['Consented pseudonymized participant'],
      exclusionCriteria: ['Withdrawn consent'],
      recruitmentSource: 'Synthetic registry',
      plannedSize: 24,
      followUpSchedule: ['baseline', 'month 3'],
    },
  },
  {
    id: 'batch-rodent-shipment-001',
    organizationId: seedOrganization.id,
    kind: 'batch',
    code: 'BATCH-ROD-SHIP-001',
    name: 'Synthetic rodent shipment batch',
    profileTypes: ['rodent'],
    speciesId: seedSpecies.mouse.id,
    status: 'active',
    validFrom: '2026-02-15',
    subjectIds: ['subject-rodent-001'],
    batch: {
      originType: 'shipment',
      sourceOrganization: 'Synthetic vendor',
      strainId: seedStrains[0].id,
      genotypeId: seedGenotypes[0].id,
      arrivalDate: '2026-02-15',
      sexComposition: 'female',
      initialCount: 12,
      currentCount: 12,
      countUnit: 'animals',
    },
  },
  {
    id: 'group-rodent-cage-a1',
    organizationId: seedOrganization.id,
    kind: 'group',
    code: 'GROUP-ROD-CAGE-A1',
    name: 'Synthetic rodent cage group A1',
    profileTypes: ['rodent'],
    speciesId: seedSpecies.mouse.id,
    status: 'active',
    validFrom: '2026-02-16',
    subjectIds: ['subject-rodent-001'],
    group: {
      groupPurpose: 'housing',
      housingUnitId: seedHousingUnits.cage.id,
      environmentalContext: {
        lightCycle: '12:12',
      },
      husbandryProtocolId: 'protocol-husbandry-rodent-standard',
      diet: 'standard chow',
      density: {
        value: 4,
        unit: 'animals/cage',
      },
      membershipPolicy: 'dynamic',
    },
  },
  {
    id: 'batch-zebrafish-spawn-001',
    organizationId: seedOrganization.id,
    kind: 'batch',
    code: 'BATCH-ZF-SPAWN-001',
    name: 'Synthetic zebrafish spawn batch',
    profileTypes: ['zebrafish_batch'],
    speciesId: seedSpecies.zebrafish.id,
    status: 'active',
    validFrom: '2026-03-01',
    subjectIds: ['subject-zebrafish-batch-001'],
    batch: {
      originType: 'spawn',
      sourceOrganization: 'Synthetic aquatic facility',
      lineId: seedLines[0].id,
      genotypeId: seedGenotypes[0].id,
      spawnDate: '2026-03-01',
      hatchDate: '2026-03-04',
      developmentalStage: 'larva',
      sexComposition: 'mixed',
      initialCount: 120,
      currentCount: 116,
      countUnit: 'larvae',
      splitMergeEventIds: ['event-mortality-zebrafish-1'],
    },
  },
  {
    id: 'group-zebrafish-tank-z1',
    organizationId: seedOrganization.id,
    kind: 'group',
    code: 'GROUP-ZF-TANK-Z1',
    name: 'Synthetic zebrafish tank group Z1',
    profileTypes: ['zebrafish_batch'],
    speciesId: seedSpecies.zebrafish.id,
    status: 'active',
    validFrom: '2026-03-01',
    subjectIds: ['subject-zebrafish-batch-001'],
    group: {
      groupPurpose: 'housing',
      housingUnitId: seedHousingUnits.tank.id,
      environmentalContext: {
        waterTemperatureC: 27.5,
        photoperiod: '14:10',
      },
      husbandryProtocolId: 'protocol-husbandry-zebrafish-standard',
      density: {
        value: 10,
        unit: 'larvae/liter',
      },
      membershipPolicy: 'event_derived',
    },
  },
  {
    id: 'cohort-synthetic-mixed',
    organizationId: seedOrganization.id,
    kind: 'cohort',
    code: 'COHORT-SYN-MIXED',
    name: 'Synthetic mixed subject cohort',
    description: 'Development cohort linking non-human synthetic subjects.',
    profileTypes: ['rodent', 'zebrafish_batch'],
    status: 'active',
    validFrom: '2026-03-01',
    subjectIds: ['subject-rodent-001', 'subject-zebrafish-batch-001'],
    cohort: {
      cohortKind: 'interventional_arm',
      studyId: 'study-synthetic-001',
      inclusionCriteria: ['Active non-human synthetic subject'],
      exclusionCriteria: ['Archived or depleted subject'],
      intervention: 'Synthetic standard observation workflow',
      randomizationMethod: 'Synthetic block allocation',
      randomizationUnit: 'subject',
      blinding: 'assessor_blinded',
      plannedSize: 2,
      followUpSchedule: ['daily welfare review', 'weekly facility review'],
    },
  },
  {
    id: 'batch-farm-birth-lot-001',
    organizationId: seedOrganization.id,
    kind: 'batch',
    code: 'BATCH-FARM-BIRTH-001',
    name: 'Synthetic farm animal birth lot',
    profileTypes: ['farm_animal'],
    speciesId: seedSpecies.cattle.id,
    status: 'active',
    validFrom: '2026-01-12',
    subjectIds: ['subject-farm-001'],
    batch: {
      originType: 'birth_lot',
      birthDate: '2026-01-12',
      sexComposition: 'mixed',
      initialCount: 8,
      currentCount: 8,
      countUnit: 'animals',
    },
  },
  {
    id: 'group-farm-herd-a',
    organizationId: seedOrganization.id,
    kind: 'group',
    code: 'GROUP-FARM-HERD-A',
    name: 'Synthetic farm herd A',
    profileTypes: ['farm_animal'],
    speciesId: seedSpecies.cattle.id,
    status: 'active',
    validFrom: '2026-01-12',
    subjectIds: ['subject-farm-001'],
    group: {
      groupPurpose: 'management',
      housingUnitId: seedHousingUnits.pasture.id,
      environmentalContext: {
        pasture: 'synthetic pasture f1',
      },
      diet: 'pasture plus synthetic supplement',
      membershipPolicy: 'dynamic',
    },
  },
  {
    id: 'batch-generic-culture-lot-001',
    organizationId: seedOrganization.id,
    kind: 'batch',
    code: 'BATCH-GEN-CULTURE-001',
    name: 'Synthetic generic culture lot',
    profileTypes: ['generic'],
    status: 'active',
    validFrom: '2026-04-01',
    subjectIds: ['subject-generic-001'],
    metadata: {
      biologicalType: 'cell culture',
      passage: 3,
    },
    batch: {
      originType: 'culture_lot',
      sourceOrganization: 'Synthetic biobank',
      arrivalDate: '2026-04-01',
      initialCount: 3,
      currentCount: 3,
      countUnit: 'cultures',
    },
  },
  {
    id: 'cohort-generic-analysis-001',
    organizationId: seedOrganization.id,
    kind: 'cohort',
    code: 'COHORT-GEN-ANALYSIS-001',
    name: 'Synthetic generic analysis set',
    profileTypes: ['generic'],
    status: 'active',
    validFrom: '2026-04-01',
    subjectIds: ['subject-generic-001'],
    cohort: {
      cohortKind: 'analysis_set',
      studyId: 'study-synthetic-001',
      inclusionCriteria: ['Synthetic cell culture fixture'],
      exclusionCriteria: ['Failed quality control'],
      plannedSize: 1,
      followUpSchedule: ['analysis export'],
    },
  },
].map((aggregate) => subjectAggregateSchema.parse(aggregate)) satisfies SubjectAggregate[];

export const seedSubjectAggregateMemberships = [
  {
    subjectId: 'subject-human-pseudo-001',
    aggregateId: 'cohort-human-observational-001',
    aggregateKind: 'cohort',
    aggregateCode: 'COHORT-HUM-OBS-001',
    aggregateName: 'Synthetic pseudonymized human observational cohort',
    role: 'analysis_member',
    validFrom: '2026-01-01',
  },
  {
    subjectId: 'subject-rodent-001',
    aggregateId: 'batch-rodent-shipment-001',
    aggregateKind: 'batch',
    aggregateCode: 'BATCH-ROD-SHIP-001',
    aggregateName: 'Synthetic rodent shipment batch',
    role: 'source',
    validFrom: '2026-02-15',
    count: 1,
  },
  {
    subjectId: 'subject-rodent-001',
    aggregateId: 'group-rodent-cage-a1',
    aggregateKind: 'group',
    aggregateCode: 'GROUP-ROD-CAGE-A1',
    aggregateName: 'Synthetic rodent cage group A1',
    role: 'housing_member',
    validFrom: '2026-02-16',
  },
  {
    subjectId: 'subject-rodent-001',
    aggregateId: 'cohort-synthetic-mixed',
    aggregateKind: 'cohort',
    aggregateCode: 'COHORT-SYN-MIXED',
    aggregateName: 'Synthetic mixed subject cohort',
    role: 'randomized_unit',
    validFrom: '2026-03-01',
  },
  {
    subjectId: 'subject-zebrafish-batch-001',
    aggregateId: 'batch-zebrafish-spawn-001',
    aggregateKind: 'batch',
    aggregateCode: 'BATCH-ZF-SPAWN-001',
    aggregateName: 'Synthetic zebrafish spawn batch',
    role: 'source',
    validFrom: '2026-03-01',
    count: 116,
  },
  {
    subjectId: 'subject-zebrafish-batch-001',
    aggregateId: 'group-zebrafish-tank-z1',
    aggregateKind: 'group',
    aggregateCode: 'GROUP-ZF-TANK-Z1',
    aggregateName: 'Synthetic zebrafish tank group Z1',
    role: 'housing_member',
    validFrom: '2026-03-01',
    count: 116,
  },
  {
    subjectId: 'subject-zebrafish-batch-001',
    aggregateId: 'cohort-synthetic-mixed',
    aggregateKind: 'cohort',
    aggregateCode: 'COHORT-SYN-MIXED',
    aggregateName: 'Synthetic mixed subject cohort',
    role: 'randomized_unit',
    validFrom: '2026-03-01',
    count: 116,
  },
  {
    subjectId: 'subject-farm-001',
    aggregateId: 'batch-farm-birth-lot-001',
    aggregateKind: 'batch',
    aggregateCode: 'BATCH-FARM-BIRTH-001',
    aggregateName: 'Synthetic farm animal birth lot',
    role: 'source',
    validFrom: '2026-01-12',
    count: 1,
  },
  {
    subjectId: 'subject-farm-001',
    aggregateId: 'group-farm-herd-a',
    aggregateKind: 'group',
    aggregateCode: 'GROUP-FARM-HERD-A',
    aggregateName: 'Synthetic farm herd A',
    role: 'member',
    validFrom: '2026-01-12',
  },
  {
    subjectId: 'subject-generic-001',
    aggregateId: 'batch-generic-culture-lot-001',
    aggregateKind: 'batch',
    aggregateCode: 'BATCH-GEN-CULTURE-001',
    aggregateName: 'Synthetic generic culture lot',
    role: 'source',
    validFrom: '2026-04-01',
    count: 1,
  },
  {
    subjectId: 'subject-generic-001',
    aggregateId: 'cohort-generic-analysis-001',
    aggregateKind: 'cohort',
    aggregateCode: 'COHORT-GEN-ANALYSIS-001',
    aggregateName: 'Synthetic generic analysis set',
    role: 'analysis_member',
    validFrom: '2026-04-01',
  },
].map((membership) =>
  subjectAggregateMembershipSchema.parse(membership),
) satisfies SubjectAggregateMembership[];

function aggregateMembershipsFor(subjectId: string): SubjectAggregateMembership[] {
  return seedSubjectAggregateMemberships.filter((membership) => membership.subjectId === subjectId);
}

export const seedSubjects = [
  {
    id: 'subject-human-pseudo-001',
    organizationId: seedOrganization.id,
    subjectCode: 'HUM-PSEUDO-001',
    profileType: 'human',
    status: 'active',
    aggregateMemberships: aggregateMembershipsFor('subject-human-pseudo-001'),
    profile: humanProfile,
  },
  {
    id: 'subject-rodent-001',
    organizationId: seedOrganization.id,
    subjectCode: 'ROD-SYN-001',
    profileType: 'rodent',
    status: 'active',
    speciesId: seedSpecies.mouse.id,
    cohortId: 'cohort-synthetic-mixed',
    aggregateMemberships: aggregateMembershipsFor('subject-rodent-001'),
    profile: rodentProfile,
  },
  {
    id: 'subject-zebrafish-batch-001',
    organizationId: seedOrganization.id,
    subjectCode: 'ZFB-SYN-001',
    profileType: 'zebrafish_batch',
    status: 'active',
    speciesId: seedSpecies.zebrafish.id,
    cohortId: 'cohort-synthetic-mixed',
    aggregateMemberships: aggregateMembershipsFor('subject-zebrafish-batch-001'),
    profile: zebrafishProfile,
  },
  {
    id: 'subject-farm-001',
    organizationId: seedOrganization.id,
    subjectCode: 'FARM-SYN-001',
    profileType: 'farm_animal',
    status: 'active',
    speciesId: seedSpecies.cattle.id,
    aggregateMemberships: aggregateMembershipsFor('subject-farm-001'),
    profile: {
      profileType: 'farm_animal',
      species: cattleProfileSpecies,
      groupIdentifier: 'herd-synthetic-a',
      individualIdentifier: 'farm-synthetic-001',
      ageDescription: 'juvenile',
      sex: 'female',
      housingUnitId: seedHousingUnits.pasture.id,
      welfareStatus: 'normal',
    },
  },
  {
    id: 'subject-generic-001',
    organizationId: seedOrganization.id,
    subjectCode: 'GEN-SYN-001',
    profileType: 'generic',
    status: 'active',
    speciesId: seedSpecies.cellCulture.id,
    aggregateMemberships: aggregateMembershipsFor('subject-generic-001'),
    profile: {
      profileType: 'generic',
      species: cellCultureProfileSpecies,
      biologicalType: 'cell culture',
      metadata: {
        passage: 3,
        fixture: true,
      },
      extensibilityNotes: 'Synthetic generic subject metadata for schema validation.',
    },
  },
] satisfies SubjectWithProfile[];

export const seedCohorts = seedSubjectAggregates.filter((aggregate) => aggregate.kind === 'cohort');

export const seedInvestigation = {
  id: 'investigation-synthetic-001',
  organizationId: seedOrganization.id,
  title: 'Synthetic COHOS investigation',
  description: 'Development fixture for investigation, study, assay, sample, and dataset flow.',
  startsOn: '2026-01-01',
};

export const seedStudy = {
  id: 'study-synthetic-001',
  investigationId: seedInvestigation.id,
  title: 'Synthetic subject management study',
  description: 'Development fixture study.',
  subjectIds: ['subject-human-pseudo-001', 'subject-rodent-001'],
  cohortIds: ['cohort-synthetic-mixed'],
};

export const seedAssay = {
  id: 'assay-synthetic-001',
  studyId: seedStudy.id,
  title: 'Synthetic observation assay',
  measurementType: 'observation',
  technologyType: 'manual record',
};

export const seedProcedure = {
  id: 'procedure-synthetic-001',
  assayId: seedAssay.id,
  name: 'Synthetic welfare check',
  description: 'Synthetic procedure record for development fixtures.',
};

export const seedSample = {
  id: 'sample-synthetic-001',
  subjectId: 'subject-rodent-001',
  assayId: seedAssay.id,
  sampleCode: 'SAMPLE-SYN-001',
  sampleType: 'derived specimen',
  collectedOn: '2026-02-01',
};

export const seedDataset = {
  id: 'dataset-synthetic-001',
  assayId: seedAssay.id,
  sampleId: seedSample.id,
  title: 'Synthetic observation dataset',
  format: 'json',
  uri: 'https://example.test/cohos/synthetic-dataset.json',
};

export const seedTransferEvent = {
  id: 'event-transfer-rodent-1',
  organizationId: seedOrganization.id,
  subjectId: 'subject-rodent-001',
  housingUnitId: seedHousingUnits.cage.id,
  occurredAt: '2026-03-01T10:00:00Z',
  recordedByUserId: 'user-seed-coordinator',
  eventType: 'transfer',
  fromHousingUnitId: undefined,
  toHousingUnitId: seedHousingUnits.cage.id,
} satisfies TransferEvent;

export const seedWelfareObservation = {
  id: 'event-welfare-rodent-1',
  organizationId: seedOrganization.id,
  subjectId: 'subject-rodent-001',
  occurredAt: '2026-03-02T10:00:00Z',
  recordedByUserId: 'user-seed-coordinator',
  eventType: 'welfare_observation',
  score: 1,
  status: 'normal',
} satisfies WelfareObservation;

export const seedEnvironmentalObservation = {
  id: 'event-env-zebrafish-1',
  organizationId: seedOrganization.id,
  housingUnitId: seedHousingUnits.tank.id,
  occurredAt: '2026-03-02T11:00:00Z',
  recordedByUserId: 'user-seed-coordinator',
  eventType: 'environmental_observation',
  metric: 'temperature',
  value: 27.5,
  unit: 'C',
} satisfies EnvironmentalObservation;

export const seedMortalityEvent = {
  id: 'event-mortality-zebrafish-1',
  organizationId: seedOrganization.id,
  subjectId: 'subject-zebrafish-batch-001',
  housingUnitId: seedHousingUnits.tank.id,
  occurredAt: '2026-03-02T11:30:00Z',
  recordedByUserId: 'user-seed-coordinator',
  eventType: 'mortality',
  count: 4,
  cause: 'Synthetic fixture mortality record',
} satisfies MortalityEvent;

export const seedAuditEvent = {
  id: 'audit-seed-subject-create-1',
  organizationId: seedOrganization.id,
  actorUserId: 'user-seed-coordinator',
  entityType: 'subject',
  entityId: 'subject-human-pseudo-001',
  action: 'subject.create',
  reason: 'Synthetic seed initialization',
  newValue: {
    hash: 'sha256:synthetic-seed-subject-human-pseudo-001',
    redacted: true,
  },
  createdAt: '2026-03-02T12:00:00Z',
  correlationId: 'seed-run-synthetic',
  source: 'seed',
} satisfies AuditEvent;

export const seedAlert = {
  id: 'alert-synthetic-info-1',
  organizationId: seedOrganization.id,
  severity: 'info',
  title: 'Synthetic seed alert',
  entityType: 'subject',
  entityId: 'subject-rodent-001',
  createdAt: '2026-03-02T12:15:00Z',
} satisfies Alert;

export const seedConnectedResourceLink = {
  id: 'link-synthetic-protocol-1',
  organizationId: seedOrganization.id,
  entityType: 'study',
  entityId: seedStudy.id,
  label: 'Synthetic external protocol',
  url: 'https://example.test/cohos/protocol',
  metadata: {
    fixture: true,
  },
} satisfies ConnectedResourceLink;

export const seedConnectorCredential = {
  id: 'connector-credential-synthetic-metadatapp',
  organizationId: seedOrganization.id,
  connectorType: 'metadatapp',
  credentialReference: 'secret://cohos/synthetic/metadatapp',
  createdAt: '2026-03-02T12:20:00Z',
} satisfies ConnectorCredential;

export const seedQRToken = {
  id: 'qr-token-synthetic-subject-1',
  organizationId: seedOrganization.id,
  purpose: 'subject_lookup',
  targetEntityType: 'subject',
  targetEntityId: 'subject-rodent-001',
  expiresAt: '2026-12-31T23:59:59Z',
  createdAt: '2026-03-02T12:25:00Z',
} satisfies QRToken;

export const syntheticSeedData = {
  notice: seedNotice,
  organization: seedOrganization,
  roles: seedRoles,
  users: seedUsers,
  species: Object.values(seedSpecies),
  lines: seedLines,
  strains: seedStrains,
  genotypes: seedGenotypes,
  facility: seedFacility,
  room: seedRoom,
  rack: seedRack,
  housingUnits: Object.values(seedHousingUnits),
  subjectAggregates: seedSubjectAggregates,
  subjectAggregateMemberships: seedSubjectAggregateMemberships,
  cohorts: seedCohorts,
  subjects: seedSubjects,
  investigation: seedInvestigation,
  study: seedStudy,
  assay: seedAssay,
  procedure: seedProcedure,
  sample: seedSample,
  dataset: seedDataset,
  events: [
    seedTransferEvent,
    seedWelfareObservation,
    seedEnvironmentalObservation,
    seedMortalityEvent,
  ],
  auditEvents: [seedAuditEvent],
  alerts: [seedAlert],
  connectedResourceLinks: [seedConnectedResourceLink],
  connectorCredentials: [seedConnectorCredential],
  qrTokens: [seedQRToken],
};
