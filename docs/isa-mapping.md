# ISA JSON Mapping

COHOS exports a stable ISA-like JSON skeleton from investigation, study, assay, subject, sample, dataset, organization, and connected-resource records. The mapper preserves COHOS identifiers in comments so downstream tools can trace exported records back to the backend source of truth.

## Package

The implementation lives in `packages/isa` and exports:

- `isaSkeletonVersion`
- `isaSkeletonLimitations`
- `createIsaJsonExport`
- TypeScript types for investigation, study, assay, source, sample, data file, process, comments, and export payloads

## Source Data

`createIsaJsonExport` accepts:

- one investigation detail
- optional organization record
- optional subjects
- optional connected resources
- optional generation timestamp

The current web reports page can build an ISA JSON download from API-backed investigation, subject, and connected-resource data.

## Current Mapping

- Organization records become root comments.
- Investigations become top-level investigation entries with dates, studies, and connected-resource comments.
- Studies become study entries with pseudonymized subject sources, derived samples, assays, cohort comments, and connected-resource comments.
- Subjects become ISA sources named by `subjectCode`; human participant examples remain pseudonymized.
- Subject characteristics include profile type, subject status, profile-specific fields, species names, and NCBITaxon values where available.
- Samples become ISA samples named by `sampleCode` and linked back to source subjects.
- Assays include measurement type, technology type, sample names, data files, and procedure-derived process entries.
- Datasets become assay data files with format, URI, dataset ID, and sample ID comments.
- Connected resources become comments on the matching investigation, study, or assay.

## Traceability

The export intentionally keeps COHOS identifiers visible in comments, including subject IDs, cohort IDs, sample IDs, dataset IDs, organization IDs, and connected-resource labels. This is enough for MVP traceability without claiming full downstream interchange compatibility.

## Data Protection

Human subjects are exported by pseudonymized subject code and pseudonymized profile code. The mapper does not introduce direct participant identifiers, but callers must still avoid adding sensitive values to subject codes, metadata, dataset URIs, or connected-resource labels.

## Limitations

This is not a complete ISA-JSON conformance implementation. ISA-Tab serialization, RO-Crate packaging, JSON-LD context publication, complete ontology term normalization, validation against an external ISA schema, and packaging of referenced data files are deferred.
