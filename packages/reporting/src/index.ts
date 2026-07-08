import type { Alert, AuditEvent, Event } from '@cohos/domain';

export const reportingPackageName = '@cohos/reporting';
export type ReportingPackageName = typeof reportingPackageName;

export const reportExportFormats = ['csv', 'json', 'pdf', 'isa_json'] as const;

export type ReportExportFormat = (typeof reportExportFormats)[number];
export type ReportExportAvailability = 'available' | 'planned';
export type OperationalReportScope =
  'audit' | 'environmental' | 'mortality' | 'research' | 'welfare';

export type ReportExportAction = {
  readonly availability: ReportExportAvailability;
  readonly format: ReportExportFormat;
  readonly label: string;
  readonly reason?: string;
};

export type OperationalReportDescriptor = {
  readonly description: string;
  readonly exportActions: readonly ReportExportAction[];
  readonly id: string;
  readonly scope: OperationalReportScope;
  readonly sourceCount: number;
  readonly title: string;
};

export type CreateOperationalReportCatalogInput = {
  readonly alerts: readonly Alert[];
  readonly auditEvents: readonly AuditEvent[];
  readonly events: readonly Event[];
  readonly investigationCount?: number;
};

export type ReportRowValue = boolean | number | string | undefined;
export type ReportRow = Readonly<Record<string, ReportRowValue>>;

const pdfPlannedReason = 'PDF rendering is planned after report layout contracts stabilize.';

export function exportFormatLabel(format: ReportExportFormat): string {
  switch (format) {
    case 'csv':
      return 'CSV';
    case 'json':
      return 'JSON';
    case 'pdf':
      return 'PDF';
    case 'isa_json':
      return 'ISA JSON';
  }
}

export function createOperationalReportCatalog(
  input: CreateOperationalReportCatalogInput,
): OperationalReportDescriptor[] {
  const welfareEvents = input.events.filter((event) => event.eventType === 'welfare_observation');
  const mortalityEvents = input.events.filter((event) => event.eventType === 'mortality');
  const environmentalEvents = input.events.filter(
    (event) => event.eventType === 'environmental_observation',
  );
  const investigationCount = input.investigationCount ?? 0;

  return [
    {
      description: 'Open alert review with source welfare observations.',
      exportActions: [
        availableAction('csv'),
        availableAction('json'),
        plannedAction('pdf', pdfPlannedReason),
      ],
      id: 'welfare-alert-review',
      scope: 'welfare',
      sourceCount: input.alerts.length + welfareEvents.length,
      title: 'Welfare alert review',
    },
    {
      description: 'Mortality and environmental observation summary for care review.',
      exportActions: [
        availableAction('csv'),
        availableAction('json'),
        plannedAction('pdf', pdfPlannedReason),
      ],
      id: 'mortality-environment-summary',
      scope: 'mortality',
      sourceCount: mortalityEvents.length + environmentalEvents.length,
      title: 'Mortality and environment summary',
    },
    {
      description: 'Append-only audit export for operational review.',
      exportActions: [availableAction('csv'), availableAction('json')],
      id: 'audit-log-export',
      scope: 'audit',
      sourceCount: input.auditEvents.length,
      title: 'Audit log export',
    },
    {
      description: 'ISA JSON skeleton generated from the current research metadata.',
      exportActions: [
        investigationCount > 0
          ? availableAction('isa_json')
          : plannedAction('isa_json', 'Research metadata is required before ISA JSON export.'),
      ],
      id: 'isa-json-research-export',
      scope: 'research',
      sourceCount: investigationCount,
      title: 'ISA JSON research export',
    },
  ];
}

export function countAvailableExportActions(
  reports: readonly OperationalReportDescriptor[],
): number {
  return reports.reduce(
    (total, report) =>
      total + report.exportActions.filter((action) => action.availability === 'available').length,
    0,
  );
}

export function toReportFileName(
  report: OperationalReportDescriptor,
  format: ReportExportFormat,
): string {
  const extension = format === 'isa_json' ? 'json' : format;

  return `${report.id}.${extension}`;
}

export function serializeReportRowsToCsv(rows: readonly ReportRow[]): string {
  const headers = Array.from(
    rows.reduce((keys, row) => {
      for (const key of Object.keys(row)) {
        keys.add(key);
      }

      return keys;
    }, new Set<string>()),
  );

  if (headers.length === 0) {
    return '';
  }

  return [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
  ].join('\n');
}

function availableAction(format: ReportExportFormat): ReportExportAction {
  return {
    availability: 'available',
    format,
    label: exportFormatLabel(format),
  };
}

function plannedAction(format: ReportExportFormat, reason: string): ReportExportAction {
  return {
    availability: 'planned',
    format,
    label: exportFormatLabel(format),
    reason,
  };
}

function escapeCsvCell(value: ReportRowValue): string {
  const serialized = value === undefined ? '' : String(value);

  if (!/[",\n\r]/.test(serialized)) {
    return serialized;
  }

  return `"${serialized.replaceAll('"', '""')}"`;
}
