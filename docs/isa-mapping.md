# ISA JSON Mapping

COHOS exports a stable ISA-like JSON skeleton from investigation, study, assay, subject, sample, dataset, and connected-resource records. The mapper preserves COHOS identifiers in comments so downstream tools can trace exported records back to the backend source of truth.

## Current Mapping

- Organization records become root comments.
- Investigations become top-level investigation entries with dates, studies, and connected-resource comments.
- Studies become study entries with pseudonymized subject sources, derived samples, assays, cohort comments, and connected-resource comments.
- Subjects become ISA sources named by `subjectCode`; human participant examples remain pseudonymized.
- Samples become ISA samples named by `sampleCode` and linked back to source subjects.
- Assays include measurement type, technology type, sample names, data files, and procedure-derived process entries.
- Datasets become assay data files with format, URI, dataset id, and sample id comments.

## Limitations

This is not a complete ISA-JSON conformance implementation. ISA-Tab serialization, RO-Crate packaging, JSON-LD context publication, and broad ontology normalization are deferred. The skeleton intentionally avoids claiming full compatibility until those behaviors are implemented and tested.
