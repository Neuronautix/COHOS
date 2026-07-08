# Welfare And Environmental Rules

COHOS rule evaluation is a configurable operational aid. The default contracts do not encode jurisdiction-specific legal thresholds as fact, and deployments should maintain local policy, ethics, and standard-operating-procedure mappings outside the open-source defaults.

## Event Inputs

The MVP evaluates rules from operational events:

- Welfare observations with subject ID, score, status, notes, timestamp, and recorder.
- Mortality events with subject ID, optional housing unit, count, cause, timestamp, and recorder.
- Environmental observations with housing unit ID, metric, value, unit, timestamp, and recorder.
- Cumulative-review placeholders over a subject event stream.

## Rule Types

The rule engine supports four MVP rule types:

- Welfare thresholds compare observation status and optional score by subject model and species.
- Mortality thresholds compare count and optional batch percentage for individual or batch contexts.
- Environmental thresholds compare housing observations against configured metric ranges.
- Cumulative harm placeholders provide a typed review hook without asserting a regulatory formula.

Rules emit alert records with rule ID, source event IDs, entity scope, severity, and metadata needed for review. They do not mutate source events or audit records.

## Derived State

The audit package derives operational state from sorted events:

- Transfer events set the current housing unit for a subject.
- Mortality events mark individual subjects deceased and subtract from batch counts.
- Batch mortality never produces negative counts; a zero count emits a `batch_depleted` flag.
- Welfare observations record latest welfare status and alert flags for watch, concern, and critical statuses.
- Environmental observations record latest housing environmental observation and informational flags.

Derived state is designed to be reproducible from the source event stream.

## Reports And UI

The welfare page reads events, alerts, subjects, and derived state through API-backed feature helpers. The reports page uses `@cohos/reporting` to describe welfare alert review, mortality and environment summary, audit export, and ISA JSON research export actions.

CSV and JSON report actions are available for operational reports. PDF remains planned until report layout contracts stabilize.

## Policy Stance

COHOS stores configurable threshold contracts and review metadata. It does not ship legal or jurisdiction-specific default thresholds. Deployments must map local policy, ethics review requirements, and operating procedures to rule configuration outside the open-source defaults.
