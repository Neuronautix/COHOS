import { PrismaClient, type Prisma } from './generated/prisma/index.js';

import { syntheticSeedData } from './seed-data.js';

const prisma = new PrismaClient();

function toDate(value: string | undefined) {
  return value === undefined ? undefined : new Date(value);
}

function optionalString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function optionalJson<T>(value: T | undefined): Prisma.InputJsonValue | undefined {
  return value === undefined ? undefined : toJson(value);
}

async function main() {
  await prisma.organization.upsert({
    where: { id: syntheticSeedData.organization.id },
    update: {},
    create: syntheticSeedData.organization,
  });

  for (const role of syntheticSeedData.roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: {
        ...role,
        permissions: [...role.permissions],
      },
    });
  }

  for (const user of syntheticSeedData.users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        organizationId: user.organizationId,
        displayName: user.displayName,
        roles: {
          create: user.roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
    });
  }

  for (const species of syntheticSeedData.species) {
    await prisma.species.upsert({
      where: { id: species.id },
      update: {},
      create: species,
    });
  }

  for (const genotype of syntheticSeedData.genotypes) {
    await prisma.genotype.upsert({
      where: { id: genotype.id },
      update: {},
      create: genotype,
    });
  }

  for (const strain of syntheticSeedData.strains) {
    await prisma.strain.upsert({
      where: { id: strain.id },
      update: {},
      create: strain,
    });
  }

  for (const line of syntheticSeedData.lines) {
    await prisma.line.upsert({
      where: { id: line.id },
      update: {},
      create: line,
    });
  }

  await prisma.facility.upsert({
    where: { id: syntheticSeedData.facility.id },
    update: {},
    create: syntheticSeedData.facility,
  });

  await prisma.room.upsert({
    where: { id: syntheticSeedData.room.id },
    update: {},
    create: syntheticSeedData.room,
  });

  await prisma.rack.upsert({
    where: { id: syntheticSeedData.rack.id },
    update: {},
    create: syntheticSeedData.rack,
  });

  for (const housingUnit of syntheticSeedData.housingUnits) {
    await prisma.housingUnit.upsert({
      where: { id: housingUnit.id },
      update: {},
      create: housingUnit,
    });
  }

  await prisma.cage.upsert({
    where: { housingUnitId: 'housing-cage-a1' },
    update: {},
    create: {
      id: 'cage-synthetic-a1',
      housingUnitId: 'housing-cage-a1',
      cageType: 'standard synthetic cage',
    },
  });

  await prisma.tank.upsert({
    where: { housingUnitId: 'housing-tank-z1' },
    update: {},
    create: {
      id: 'tank-synthetic-z1',
      housingUnitId: 'housing-tank-z1',
      volumeLiters: 12,
    },
  });

  for (const aggregate of syntheticSeedData.subjectAggregates) {
    await prisma.subjectAggregate.upsert({
      where: { id: aggregate.id },
      update: {
        name: aggregate.name,
        description: aggregate.description,
        profileTypes: [...aggregate.profileTypes],
        speciesId: aggregate.speciesId,
        status: aggregate.status,
        validFrom: toDate(aggregate.validFrom),
        validTo: toDate(aggregate.validTo),
        metadata: toJson(aggregate.metadata),
        batchMetadata: optionalJson(aggregate.kind === 'batch' ? aggregate.batch : undefined),
        groupMetadata: optionalJson(aggregate.kind === 'group' ? aggregate.group : undefined),
        cohortMetadata: optionalJson(aggregate.kind === 'cohort' ? aggregate.cohort : undefined),
      },
      create: {
        id: aggregate.id,
        organizationId: aggregate.organizationId,
        kind: aggregate.kind,
        code: aggregate.code,
        name: aggregate.name,
        description: aggregate.description,
        profileTypes: [...aggregate.profileTypes],
        speciesId: aggregate.speciesId,
        status: aggregate.status,
        validFrom: toDate(aggregate.validFrom),
        validTo: toDate(aggregate.validTo),
        metadata: toJson(aggregate.metadata),
        batchMetadata: optionalJson(aggregate.kind === 'batch' ? aggregate.batch : undefined),
        groupMetadata: optionalJson(aggregate.kind === 'group' ? aggregate.group : undefined),
        cohortMetadata: optionalJson(aggregate.kind === 'cohort' ? aggregate.cohort : undefined),
      },
    });
  }

  for (const cohort of syntheticSeedData.cohorts) {
    await prisma.cohort.upsert({
      where: { id: cohort.id },
      update: {},
      create: {
        id: cohort.id,
        organizationId: cohort.organizationId,
        name: cohort.name,
        description: cohort.description,
      },
    });
  }

  for (const subject of syntheticSeedData.subjects) {
    await prisma.subject.upsert({
      where: { id: subject.id },
      update: {},
      create: {
        id: subject.id,
        organizationId: subject.organizationId,
        subjectCode: subject.subjectCode,
        profileType: subject.profileType,
        status: subject.status,
        speciesId: subject.speciesId,
        cohortId: subject.cohortId,
        subjectProfile: {
          create: {
            id: `profile-${subject.id}`,
            profileType: subject.profileType,
            data: subject.profile,
          },
        },
      },
    });

    await prisma.subjectProfile.upsert({
      where: { subjectId: subject.id },
      update: {
        data: subject.profile,
      },
      create: {
        id: `profile-${subject.id}`,
        subjectId: subject.id,
        profileType: subject.profileType,
        data: subject.profile,
      },
    });

    if (subject.profile.profileType === 'human') {
      await prisma.humanSubjectProfile.upsert({
        where: { subjectId: subject.id },
        update: {
          consentStatus: subject.profile.consentStatus,
          studyParticipationStatus: subject.profile.studyParticipationStatus,
        },
        create: {
          id: `human-profile-${subject.id}`,
          subjectId: subject.id,
          pseudonymizedSubjectCode: subject.profile.pseudonymizedSubjectCode,
          consentStatus: subject.profile.consentStatus,
          studyParticipationStatus: subject.profile.studyParticipationStatus,
          ageBand: subject.profile.ageBand,
          sex: subject.profile.sex,
          genderIdentity: subject.profile.genderIdentity,
        },
      });
    }

    if (subject.profile.profileType === 'rodent') {
      await prisma.rodentSubjectProfile.upsert({
        where: { subjectId: subject.id },
        update: {
          welfareStatus: subject.profile.welfareStatus,
          housingUnitId: subject.profile.housingUnitId,
        },
        create: {
          id: `rodent-profile-${subject.id}`,
          subjectId: subject.id,
          speciesId: subject.profile.species.id,
          strainId: subject.profile.strainId,
          lineId: optionalString('lineId' in subject.profile ? subject.profile.lineId : undefined),
          genotypeId: subject.profile.genotypeId,
          sex: subject.profile.sex,
          dateOfBirth:
            'dateOfBirth' in subject.profile
              ? toDate(optionalString(subject.profile.dateOfBirth))
              : undefined,
          ageDays: subject.profile.ageDays,
          housingUnitId: subject.profile.housingUnitId,
          welfareStatus: subject.profile.welfareStatus,
        },
      });
    }

    if (subject.profile.profileType === 'zebrafish_batch') {
      await prisma.zebrafishBatchProfile.upsert({
        where: { subjectId: subject.id },
        update: {
          count: subject.profile.count,
          tankId: subject.profile.tankId,
        },
        create: {
          id: `zebrafish-profile-${subject.id}`,
          subjectId: subject.id,
          speciesId: subject.profile.species.id,
          batchIdentifier: subject.profile.batchIdentifier,
          lineId: subject.profile.lineId,
          genotypeId: subject.profile.genotypeId,
          developmentalStage: subject.profile.developmentalStage,
          tankId: subject.profile.tankId,
          count: subject.profile.count,
        },
      });
    }

    if (subject.profile.profileType === 'farm_animal') {
      await prisma.farmAnimalProfile.upsert({
        where: { subjectId: subject.id },
        update: {
          welfareStatus: subject.profile.welfareStatus,
          housingUnitId: subject.profile.housingUnitId,
        },
        create: {
          id: `farm-profile-${subject.id}`,
          subjectId: subject.id,
          speciesId: subject.profile.species.id,
          groupIdentifier: subject.profile.groupIdentifier,
          individualIdentifier: subject.profile.individualIdentifier,
          birthDate:
            'birthDate' in subject.profile
              ? toDate(optionalString(subject.profile.birthDate))
              : undefined,
          ageDescription: subject.profile.ageDescription,
          sex: subject.profile.sex,
          housingUnitId: subject.profile.housingUnitId,
          welfareStatus: subject.profile.welfareStatus,
        },
      });
    }

    if (subject.profile.profileType === 'generic') {
      await prisma.genericSubjectProfile.upsert({
        where: { subjectId: subject.id },
        update: {
          metadata: subject.profile.metadata,
        },
        create: {
          id: `generic-profile-${subject.id}`,
          subjectId: subject.id,
          speciesId: subject.profile.species?.id,
          biologicalType: subject.profile.biologicalType,
          metadata: subject.profile.metadata,
          extensibilityNotes: subject.profile.extensibilityNotes,
        },
      });
    }
  }

  for (const membership of syntheticSeedData.subjectAggregateMemberships) {
    await prisma.subjectAggregateMembership.upsert({
      where: {
        subjectId_aggregateId_role: {
          subjectId: membership.subjectId,
          aggregateId: membership.aggregateId,
          role: membership.role,
        },
      },
      update: {
        validFrom: toDate(membership.validFrom),
        validTo: toDate(membership.validTo),
        count: membership.count,
        metadata: toJson(membership.metadata),
      },
      create: {
        subjectId: membership.subjectId,
        aggregateId: membership.aggregateId,
        role: membership.role,
        validFrom: toDate(membership.validFrom),
        validTo: toDate(membership.validTo),
        count: membership.count,
        metadata: toJson(membership.metadata),
      },
    });
  }

  await prisma.investigation.upsert({
    where: { id: syntheticSeedData.investigation.id },
    update: {},
    create: {
      ...syntheticSeedData.investigation,
      startsOn: toDate(syntheticSeedData.investigation.startsOn),
    },
  });

  await prisma.study.upsert({
    where: { id: syntheticSeedData.study.id },
    update: {},
    create: {
      id: syntheticSeedData.study.id,
      investigationId: syntheticSeedData.study.investigationId,
      title: syntheticSeedData.study.title,
      description: syntheticSeedData.study.description,
    },
  });

  for (const subjectId of syntheticSeedData.study.subjectIds) {
    await prisma.studySubject.upsert({
      where: {
        studyId_subjectId: {
          studyId: syntheticSeedData.study.id,
          subjectId,
        },
      },
      update: {},
      create: {
        studyId: syntheticSeedData.study.id,
        subjectId,
      },
    });
  }

  for (const cohortId of syntheticSeedData.study.cohortIds) {
    await prisma.studyCohort.upsert({
      where: {
        studyId_cohortId: {
          studyId: syntheticSeedData.study.id,
          cohortId,
        },
      },
      update: {},
      create: {
        studyId: syntheticSeedData.study.id,
        cohortId,
      },
    });
  }

  await prisma.assay.upsert({
    where: { id: syntheticSeedData.assay.id },
    update: {},
    create: syntheticSeedData.assay,
  });

  await prisma.procedure.upsert({
    where: { id: syntheticSeedData.procedure.id },
    update: {},
    create: syntheticSeedData.procedure,
  });

  await prisma.sample.upsert({
    where: { id: syntheticSeedData.sample.id },
    update: {},
    create: {
      ...syntheticSeedData.sample,
      collectedOn: toDate(syntheticSeedData.sample.collectedOn),
    },
  });

  await prisma.dataset.upsert({
    where: { id: syntheticSeedData.dataset.id },
    update: {},
    create: syntheticSeedData.dataset,
  });

  for (const link of syntheticSeedData.connectedResourceLinks) {
    await prisma.connectedResourceLink.upsert({
      where: { id: link.id },
      update: {},
      create: link,
    });
  }

  for (const event of syntheticSeedData.events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: {
        id: event.id,
        organizationId: event.organizationId,
        subjectId: 'subjectId' in event ? event.subjectId : undefined,
        housingUnitId: 'housingUnitId' in event ? event.housingUnitId : undefined,
        eventType: event.eventType,
        occurredAt: new Date(event.occurredAt),
        recordedByUserId: event.recordedByUserId,
        reason: optionalString('reason' in event ? event.reason : undefined),
      },
    });

    if (event.eventType === 'transfer') {
      await prisma.transferEvent.upsert({
        where: { eventId: event.id },
        update: {},
        create: {
          id: `transfer-${event.id}`,
          eventId: event.id,
          fromHousingUnitId: event.fromHousingUnitId,
          toHousingUnitId: event.toHousingUnitId,
        },
      });
    }

    if (event.eventType === 'welfare_observation') {
      await prisma.welfareObservation.upsert({
        where: { eventId: event.id },
        update: {},
        create: {
          id: `welfare-${event.id}`,
          eventId: event.id,
          score: event.score,
          status: event.status,
          notes: optionalString('notes' in event ? event.notes : undefined),
        },
      });
    }

    if (event.eventType === 'mortality') {
      await prisma.mortalityEvent.upsert({
        where: { eventId: event.id },
        update: {},
        create: {
          id: `mortality-${event.id}`,
          eventId: event.id,
          count: event.count,
          cause: optionalString('cause' in event ? event.cause : undefined),
        },
      });
    }

    if (event.eventType === 'environmental_observation') {
      await prisma.environmentalObservation.upsert({
        where: { eventId: event.id },
        update: {},
        create: {
          id: `environmental-${event.id}`,
          eventId: event.id,
          metric: event.metric,
          value: event.value,
          unit: event.unit,
        },
      });
    }
  }

  for (const auditEvent of syntheticSeedData.auditEvents) {
    await prisma.auditEvent.upsert({
      where: { id: auditEvent.id },
      update: {},
      create: {
        ...auditEvent,
        createdAt: new Date(auditEvent.createdAt),
      },
    });
  }

  for (const alert of syntheticSeedData.alerts) {
    await prisma.alert.upsert({
      where: { id: alert.id },
      update: {},
      create: {
        ...alert,
        createdAt: new Date(alert.createdAt),
        resolvedAt: 'resolvedAt' in alert ? toDate(optionalString(alert.resolvedAt)) : undefined,
      },
    });
  }

  for (const credential of syntheticSeedData.connectorCredentials) {
    await prisma.connectorCredential.upsert({
      where: { id: credential.id },
      update: {},
      create: {
        ...credential,
        createdAt: new Date(credential.createdAt),
      },
    });
  }

  for (const qrToken of syntheticSeedData.qrTokens) {
    await prisma.qRToken.upsert({
      where: { id: qrToken.id },
      update: {},
      create: {
        ...qrToken,
        expiresAt: new Date(qrToken.expiresAt),
        revokedAt: 'revokedAt' in qrToken ? toDate(optionalString(qrToken.revokedAt)) : undefined,
        createdAt: new Date(qrToken.createdAt),
      },
    });
  }

  console.log(`Seeded ${syntheticSeedData.subjects.length} synthetic COHOS subjects.`);
}

await main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
