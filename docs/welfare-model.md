# Welfare And Environmental Rules

COHOS rule evaluation is a configurable operational aid. The default contracts do not encode jurisdiction-specific legal thresholds as fact, and deployments should maintain local policy, ethics, and standard-operating-procedure mappings outside the open-source defaults.

The rule engine supports four MVP rule types:

- Welfare thresholds compare observation status and optional score by subject model and species.
- Mortality thresholds compare count and optional batch percentage for individual or batch contexts.
- Environmental thresholds compare housing observations against configured metric ranges.
- Cumulative harm placeholders provide a typed review hook without asserting a regulatory formula.

Rules emit alert records with rule id, source event ids, entity scope, severity, and metadata needed for review. They do not mutate source events or audit records.
