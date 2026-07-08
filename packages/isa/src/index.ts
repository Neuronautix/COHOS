import type {
  AssayDetail,
  ConnectedResourceLink,
  Dataset,
  InvestigationDetail,
  Organization,
  Procedure,
  Sample,
  StudyDetail,
  SubjectWithProfile,
} from '@cohos/domain';

export const isaPackageName = '@cohos/isa';

export type IsaPackageName = typeof isaPackageName;

export const isaSkeletonVersion = 'COHOS-ISA-JSON-SKELETON-0.1' as const;

export type IsaComment = {
  readonly name: string;
  readonly value: string;
};

export type IsaCharacteristic = {
  readonly category: string;
  readonly value: string | number | boolean;
};

export type IsaSource = {
  readonly name: string;
  readonly characteristics: readonly IsaCharacteristic[];
  readonly comments: readonly IsaComment[];
};

export type IsaSample = {
  readonly name: string;
  readonly derivesFrom: string;
  readonly sampleType: string;
  readonly characteristics: readonly IsaCharacteristic[];
  readonly comments: readonly IsaComment[];
};

export type IsaDataFile = {
  readonly name: string;
  readonly format: string;
  readonly uri?: string;
  readonly comments: readonly IsaComment[];
};

export type IsaProcess = {
  readonly name: string;
  readonly protocolName: string;
  readonly protocolDescription?: string;
};

export type IsaAssay = {
  readonly identifier: string;
  readonly title: string;
  readonly measurementType?: string;
  readonly technologyType?: string;
  readonly samples: readonly string[];
  readonly dataFiles: readonly IsaDataFile[];
  readonly processSequence: readonly IsaProcess[];
  readonly comments: readonly IsaComment[];
};

export type IsaStudy = {
  readonly identifier: string;
  readonly title: string;
  readonly description?: string;
  readonly sources: readonly IsaSource[];
  readonly samples: readonly IsaSample[];
  readonly assays: readonly IsaAssay[];
  readonly comments: readonly IsaComment[];
};

export type IsaInvestigation = {
  readonly identifier: string;
  readonly title: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly studies: readonly IsaStudy[];
  readonly comments: readonly IsaComment[];
};

export type IsaJsonExport = {
  readonly isaVersion: typeof isaSkeletonVersion;
  readonly generatedAt: string;
  readonly investigations: readonly IsaInvestigation[];
  readonly comments: readonly IsaComment[];
  readonly limitations: readonly string[];
};

export type CreateIsaJsonExportInput = {
  readonly connectedResources?: readonly ConnectedResourceLink[];
  readonly generatedAt?: string;
  readonly investigation: InvestigationDetail;
  readonly organization?: Organization;
  readonly subjects?: readonly SubjectWithProfile[];
};

export const isaSkeletonLimitations = [
  'This is an ISA-like JSON skeleton, not a complete ISA-JSON conformance implementation.',
  'ISA-Tab serialization is intentionally deferred.',
  'RO-Crate packaging is intentionally deferred.',
  'JSON-LD context publication is intentionally deferred.',
  'Ontology term normalization is intentionally deferred beyond preserved COHOS identifiers and NCBITaxon values.',
] as const;

function connectedResourceComments(
  resources: readonly ConnectedResourceLink[],
  entityType: string,
  entityId: string,
): IsaComment[] {
  return resources
    .filter((resource) => resource.entityType === entityType && resource.entityId === entityId)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((resource) => ({
      name: `COHOS connected resource: ${resource.label}`,
      value: resource.url,
    }));
}

function studyConnectedResources(study: StudyDetail): readonly ConnectedResourceLink[] {
  return [
    ...study.connectedResources,
    ...study.assays.flatMap((assay) => assay.connectedResources),
  ];
}

function investigationConnectedResources(
  investigation: InvestigationDetail,
  extraResources: readonly ConnectedResourceLink[],
): ConnectedResourceLink[] {
  return [
    ...extraResources,
    ...investigation.connectedResources,
    ...investigation.studies.flatMap(studyConnectedResources),
  ];
}

function subjectSpeciesCharacteristics(subject: SubjectWithProfile): IsaCharacteristic[] {
  if (!('species' in subject.profile) || subject.profile.species === undefined) {
    return [];
  }

  const species = subject.profile.species;
  const characteristics: IsaCharacteristic[] = [
    {
      category: 'species common name',
      value: species.commonName,
    },
    {
      category: 'species scientific name',
      value: species.scientificName,
    },
  ];

  if (species.ncbiTaxonId !== undefined) {
    characteristics.push({
      category: 'NCBI Taxon ID',
      value: species.ncbiTaxonId,
    });
  }

  return characteristics;
}

function subjectProfileCharacteristics(subject: SubjectWithProfile): IsaCharacteristic[] {
  const baseCharacteristics: IsaCharacteristic[] = [
    {
      category: 'COHOS subject profile type',
      value: subject.profileType,
    },
    {
      category: 'COHOS subject status',
      value: subject.status,
    },
  ];

  if (subject.profile.profileType === 'zebrafish_batch') {
    baseCharacteristics.push(
      {
        category: 'batch identifier',
        value: subject.profile.batchIdentifier,
      },
      {
        category: 'developmental stage',
        value: subject.profile.developmentalStage,
      },
      {
        category: 'batch count',
        value: subject.profile.count,
      },
    );
  }

  if (subject.profile.profileType === 'rodent' || subject.profile.profileType === 'farm_animal') {
    baseCharacteristics.push({
      category: 'sex',
      value: subject.profile.sex,
    });
  }

  if (subject.profile.profileType === 'generic') {
    baseCharacteristics.push({
      category: 'biological type',
      value: subject.profile.biologicalType,
    });
  }

  if (subject.profile.profileType === 'human') {
    baseCharacteristics.push({
      category: 'pseudonymized subject code',
      value: subject.profile.pseudonymizedSubjectCode,
    });
  }

  return [...baseCharacteristics, ...subjectSpeciesCharacteristics(subject)];
}

function toIsaSource(subject: SubjectWithProfile): IsaSource {
  return {
    name: subject.subjectCode,
    characteristics: subjectProfileCharacteristics(subject),
    comments: [
      {
        name: 'COHOS subject id',
        value: subject.id,
      },
    ],
  };
}

function toIsaSample(
  sample: Sample,
  subjectById: ReadonlyMap<string, SubjectWithProfile>,
): IsaSample {
  const subject = subjectById.get(sample.subjectId);

  return {
    name: sample.sampleCode,
    derivesFrom: subject?.subjectCode ?? sample.subjectId,
    sampleType: sample.sampleType,
    characteristics: [
      {
        category: 'COHOS sample id',
        value: sample.id,
      },
      {
        category: 'sample type',
        value: sample.sampleType,
      },
      ...(sample.collectedOn === undefined
        ? []
        : [
            {
              category: 'collected on',
              value: sample.collectedOn,
            },
          ]),
    ],
    comments: [
      {
        name: 'COHOS source subject id',
        value: sample.subjectId,
      },
    ],
  };
}

function toIsaDataFile(dataset: Dataset): IsaDataFile {
  return {
    name: dataset.title,
    format: dataset.format,
    ...(dataset.uri === undefined ? {} : { uri: dataset.uri }),
    comments: [
      {
        name: 'COHOS dataset id',
        value: dataset.id,
      },
      ...(dataset.sampleId === undefined
        ? []
        : [
            {
              name: 'COHOS sample id',
              value: dataset.sampleId,
            },
          ]),
    ],
  };
}

function toIsaProcess(procedure: Procedure): IsaProcess {
  return {
    name: procedure.name,
    protocolName: procedure.name,
    ...(procedure.description === undefined ? {} : { protocolDescription: procedure.description }),
  };
}

function assaySamples(assay: AssayDetail): string[] {
  return assay.samples
    .map((sample) => sample.sampleCode)
    .sort((left, right) => left.localeCompare(right));
}

function toIsaAssay(
  assay: AssayDetail,
  connectedResources: readonly ConnectedResourceLink[],
): IsaAssay {
  return {
    identifier: assay.id,
    title: assay.title,
    ...(assay.measurementType === undefined ? {} : { measurementType: assay.measurementType }),
    ...(assay.technologyType === undefined ? {} : { technologyType: assay.technologyType }),
    samples: assaySamples(assay),
    dataFiles: assay.datasets.map(toIsaDataFile),
    processSequence: assay.procedures.map(toIsaProcess),
    comments: connectedResourceComments(connectedResources, 'assay', assay.id),
  };
}

function uniqueSamples(study: StudyDetail): Sample[] {
  const samples = new Map<string, Sample>();

  for (const assay of study.assays) {
    for (const sample of assay.samples) {
      samples.set(sample.id, sample);
    }
  }

  return Array.from(samples.values()).sort((left, right) => left.id.localeCompare(right.id));
}

function toIsaStudy(
  study: StudyDetail,
  subjectById: ReadonlyMap<string, SubjectWithProfile>,
  connectedResources: readonly ConnectedResourceLink[],
): IsaStudy {
  return {
    identifier: study.id,
    title: study.title,
    ...(study.description === undefined ? {} : { description: study.description }),
    sources: study.subjectIds
      .map((subjectId) => subjectById.get(subjectId))
      .filter((subject): subject is SubjectWithProfile => subject !== undefined)
      .map(toIsaSource),
    samples: uniqueSamples(study).map((sample) => toIsaSample(sample, subjectById)),
    assays: study.assays.map((assay) => toIsaAssay(assay, connectedResources)),
    comments: [
      ...connectedResourceComments(connectedResources, 'study', study.id),
      ...study.cohortIds.map((cohortId) => ({
        name: 'COHOS cohort id',
        value: cohortId,
      })),
    ],
  };
}

function toIsaInvestigation(
  investigation: InvestigationDetail,
  subjectById: ReadonlyMap<string, SubjectWithProfile>,
  connectedResources: readonly ConnectedResourceLink[],
): IsaInvestigation {
  return {
    identifier: investigation.id,
    title: investigation.title,
    ...(investigation.description === undefined ? {} : { description: investigation.description }),
    ...(investigation.startsOn === undefined ? {} : { startDate: investigation.startsOn }),
    ...(investigation.endsOn === undefined ? {} : { endDate: investigation.endsOn }),
    studies: investigation.studies.map((study) =>
      toIsaStudy(study, subjectById, connectedResources),
    ),
    comments: connectedResourceComments(connectedResources, 'investigation', investigation.id),
  };
}

function rootComments(input: CreateIsaJsonExportInput): IsaComment[] {
  return [
    ...(input.organization === undefined
      ? []
      : [
          {
            name: 'COHOS organization',
            value: input.organization.name,
          },
          {
            name: 'COHOS organization id',
            value: input.organization.id,
          },
        ]),
  ];
}

export function createIsaJsonExport(input: CreateIsaJsonExportInput): IsaJsonExport {
  const subjects = input.subjects ?? [];
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const connectedResources = investigationConnectedResources(
    input.investigation,
    input.connectedResources ?? [],
  );

  return {
    isaVersion: isaSkeletonVersion,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    investigations: [toIsaInvestigation(input.investigation, subjectById, connectedResources)],
    comments: rootComments(input),
    limitations: [...isaSkeletonLimitations],
  };
}
