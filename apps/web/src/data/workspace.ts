import type { StatusTone } from '@cohos/ui';

export type MetricConfig = {
  readonly detail: string;
  readonly label: string;
  readonly tone?: StatusTone;
  readonly value: string;
};

export type WorkItemConfig = {
  readonly detail: string;
  readonly status: string;
  readonly title: string;
  readonly tone?: StatusTone;
};

export type PanelConfig = {
  readonly eyebrow?: string;
  readonly items: WorkItemConfig[];
  readonly title: string;
};

export type WorkspacePageConfig = {
  readonly eyebrow: string;
  readonly metrics: MetricConfig[];
  readonly panels: PanelConfig[];
  readonly summary: string;
  readonly title: string;
};

export const dashboardConfig = {
  eyebrow: 'Operations',
  title: 'Dashboard',
  summary:
    'Live workspace entry point for subject operations, study context, welfare status, and exports.',
  metrics: [
    {
      detail: 'Across human, rodent, zebrafish, farm, and generic models',
      label: 'Subject models',
      tone: 'info',
      value: '5',
    },
    {
      detail: 'Facility hierarchy and housing detail routes are available',
      label: 'Operational areas',
      tone: 'success',
      value: '9',
    },
    {
      detail: 'Welfare, environmental, and mortality signals',
      label: 'Alert streams',
      tone: 'warning',
      value: '3',
    },
    {
      detail: 'ISA export and connector settings remain visible in navigation',
      label: 'Export paths',
      tone: 'neutral',
      value: '2',
    },
  ],
  panels: [
    {
      eyebrow: 'Today',
      title: 'Priority queues',
      items: [
        {
          detail: 'Review open welfare observations and cumulative alert signals.',
          status: 'Ready',
          title: 'Welfare review',
          tone: 'warning',
        },
        {
          detail:
            'Confirm recent transfers before subject detail views consume derived housing state.',
          status: 'Queued',
          title: 'Transfer verification',
          tone: 'info',
        },
        {
          detail: 'Prepare investigation, study, and assay exports from backend contracts.',
          status: 'Ready',
          title: 'Research export',
          tone: 'success',
        },
      ],
    },
    {
      eyebrow: 'System',
      title: 'Backend contracts',
      items: [
        {
          detail: 'Subject, facility, event, audit, QR, connector, and ISA contracts are typed.',
          status: 'Typed',
          title: 'Domain surface',
          tone: 'success',
        },
        {
          detail: 'TanStack Query provider is mounted for API-backed pages.',
          status: 'Mounted',
          title: 'Data fetching',
          tone: 'success',
        },
        {
          detail: 'Navigation routes match the current MVP backlog sequence.',
          status: 'Aligned',
          title: 'Workspace shell',
          tone: 'info',
        },
      ],
    },
  ],
} satisfies WorkspacePageConfig;

export const workspacePages = {
  subjects: {
    eyebrow: 'Registry',
    title: 'Subjects',
    summary: 'Subject registry surface for pseudonymized participants and research animals.',
    metrics: [
      {
        detail: 'Participant, rodent, zebrafish, farm, and generic profiles',
        label: 'Profile models',
        tone: 'info',
        value: '5',
      },
      {
        detail: 'Human displays use pseudonymized subject codes',
        label: 'Privacy mode',
        tone: 'success',
        value: 'On',
      },
      {
        detail: 'Profile-specific create and detail surfaces',
        label: 'View depth',
        tone: 'neutral',
        value: 'Profile',
      },
    ],
    panels: [
      {
        title: 'Registry lanes',
        items: [
          {
            detail: 'Human participant rows expose study-safe codes and profile metadata.',
            status: 'Protected',
            title: 'Participants',
            tone: 'success',
          },
          {
            detail: 'Rodent and farm animal subjects carry species and housing context.',
            status: 'Typed',
            title: 'Individual animals',
            tone: 'info',
          },
          {
            detail: 'Batch views keep counts and derived event state visible.',
            status: 'Typed',
            title: 'Aquatic batches',
            tone: 'info',
          },
        ],
      },
    ],
  },
  facilities: {
    eyebrow: 'Housing',
    title: 'Facility',
    summary:
      'Facility, room, rack, cage, tank, and pasture navigation for operational housing state.',
    metrics: [
      {
        detail: 'Facility, room, rack, housing unit, cage, tank, and pasture',
        label: 'Hierarchy levels',
        tone: 'info',
        value: '7',
      },
      {
        detail: 'Current occupants come from event-derived state',
        label: 'Occupancy',
        tone: 'success',
        value: 'Derived',
      },
      {
        detail: 'Room, rack, and housing-unit pages',
        label: 'View depth',
        tone: 'neutral',
        value: 'Housing',
      },
    ],
    panels: [
      {
        title: 'Housing lanes',
        items: [
          {
            detail: 'Cage and tank pages can surface current occupants and environment status.',
            status: 'Ready',
            title: 'Unit detail',
            tone: 'success',
          },
          {
            detail: 'Transfers remain anchored to event and audit contracts.',
            status: 'Audited',
            title: 'Movement history',
            tone: 'info',
          },
        ],
      },
    ],
  },
  investigations: {
    eyebrow: 'Research',
    title: 'Investigations',
    summary: 'Investigation, study, assay, procedure, and connected-resource workspace.',
    metrics: [
      {
        detail: 'Investigation, study, assay, and procedure routes',
        label: 'Metadata levels',
        tone: 'info',
        value: '4',
      },
      {
        detail: 'ISA-like JSON export package is available',
        label: 'Export model',
        tone: 'success',
        value: 'ISA',
      },
      {
        detail: 'Investigation, study, and assay pages',
        label: 'View depth',
        tone: 'neutral',
        value: 'Metadata',
      },
    ],
    panels: [
      {
        title: 'Research lanes',
        items: [
          {
            detail:
              'Study and assay pages share subject association and connected-resource patterns.',
            status: 'Aligned',
            title: 'Metadata navigation',
            tone: 'success',
          },
          {
            detail: 'External provenance appears through connected resource links.',
            status: 'Visible',
            title: 'Connected resources',
            tone: 'info',
          },
        ],
      },
    ],
  },
  welfare: {
    eyebrow: 'Care',
    title: 'Welfare',
    summary: 'Welfare observations, environmental thresholds, mortality signals, and alert review.',
    metrics: [
      {
        detail: 'Welfare, environment, and mortality threshold streams',
        label: 'Rule streams',
        tone: 'warning',
        value: '3',
      },
      {
        detail: 'Rules are configurable and avoid jurisdiction-specific legal claims',
        label: 'Policy stance',
        tone: 'success',
        value: 'Configurable',
      },
      {
        detail: 'Alert review and report surfaces',
        label: 'View depth',
        tone: 'neutral',
        value: 'Alerts',
      },
    ],
    panels: [
      {
        title: 'Review lanes',
        items: [
          {
            detail: 'Observation queues can show severity, subject context, and latest event time.',
            status: 'Ready',
            title: 'Welfare observations',
            tone: 'warning',
          },
          {
            detail: 'Environmental status is modeled for housing-unit review.',
            status: 'Ready',
            title: 'Environment',
            tone: 'info',
          },
        ],
      },
    ],
  },
  reports: {
    eyebrow: 'Exports',
    title: 'Reports',
    summary:
      'Operational reports and exports for audit, welfare, mortality, and research metadata.',
    metrics: [
      {
        detail: 'CSV, JSON, PDF, and ISA JSON are represented in the backlog',
        label: 'Export formats',
        tone: 'info',
        value: '4',
      },
      {
        detail: 'Append-only audit records are available to reporting surfaces',
        label: 'Audit trail',
        tone: 'success',
        value: 'On',
      },
      {
        detail: 'Operational and research exports',
        label: 'View depth',
        tone: 'neutral',
        value: 'Exports',
      },
    ],
    panels: [
      {
        title: 'Report lanes',
        items: [
          {
            detail: 'Welfare and mortality reports consume event-derived state.',
            status: 'Ready',
            title: 'Care reports',
            tone: 'warning',
          },
          {
            detail: 'Research exports consume ISA mapping contracts.',
            status: 'Ready',
            title: 'Study exports',
            tone: 'success',
          },
        ],
      },
    ],
  },
  connectors: {
    eyebrow: 'Integration',
    title: 'Connectors',
    summary:
      'Connector settings, credential references, health checks, and export synchronization.',
    metrics: [
      {
        detail: 'Implementation-agnostic connector interface',
        label: 'Connector API',
        tone: 'success',
        value: 'Typed',
      },
      {
        detail: 'Credential fields use references rather than raw secret values',
        label: 'Secret handling',
        tone: 'success',
        value: 'Referenced',
      },
      {
        detail: 'Provider settings and export synchronization',
        label: 'View depth',
        tone: 'neutral',
        value: 'Settings',
      },
    ],
    panels: [
      {
        title: 'Connector lanes',
        items: [
          {
            detail:
              'Health checks report provider, status, and next action without live credentials.',
            status: 'Ready',
            title: 'Health checks',
            tone: 'info',
          },
          {
            detail: 'ISA export and connected resources share the integration surface.',
            status: 'Aligned',
            title: 'Export sync',
            tone: 'success',
          },
        ],
      },
    ],
  },
  'qr-scan': {
    eyebrow: 'Scan',
    title: 'QR scan',
    summary: 'Token scan workflow for bounded quick actions on subjects and housing units.',
    metrics: [
      {
        detail: 'Valid, expired, and revoked statuses are modeled',
        label: 'Scan statuses',
        tone: 'info',
        value: '3',
      },
      {
        detail: 'Subject and housing tokens return quick-action intents',
        label: 'Action targets',
        tone: 'success',
        value: '2',
      },
      {
        detail: 'Generated QR images and auth checks remain backend work',
        label: 'Deferred',
        tone: 'neutral',
        value: '2',
      },
    ],
    panels: [
      {
        title: 'Scan lanes',
        items: [
          {
            detail: 'Subject tokens can open detail and welfare observation actions.',
            status: 'Ready',
            title: 'Subject scan',
            tone: 'success',
          },
          {
            detail: 'Housing tokens can open unit, environment, and transfer actions.',
            status: 'Ready',
            title: 'Housing scan',
            tone: 'success',
          },
        ],
      },
    ],
  },
  admin: {
    eyebrow: 'Settings',
    title: 'Admin settings',
    summary: 'Workspace settings for rule thresholds, connector references, and system readiness.',
    metrics: [
      {
        detail: 'Thresholds are modeled as configurable values',
        label: 'Rules',
        tone: 'info',
        value: 'Configurable',
      },
      {
        detail: 'Credential references avoid raw secret storage',
        label: 'Credentials',
        tone: 'success',
        value: 'Referenced',
      },
      {
        detail: 'CI and release readiness checks stay visible for operators',
        label: 'Readiness',
        tone: 'neutral',
        value: 'Tracked',
      },
    ],
    panels: [
      {
        title: 'Admin lanes',
        items: [
          {
            detail: 'Rule thresholds can be surfaced without encoding local law as product facts.',
            status: 'Scoped',
            title: 'Thresholds',
            tone: 'warning',
          },
          {
            detail: 'Connector credentials stay reference-only in UI contracts.',
            status: 'Protected',
            title: 'Credentials',
            tone: 'success',
          },
        ],
      },
    ],
  },
} satisfies Record<string, WorkspacePageConfig>;
