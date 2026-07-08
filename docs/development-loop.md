# Development Loop

This repository uses a small repeatable loop: branch, implement a focused ticket, validate locally, update the backlog with evidence, open a PR, merge, and sync `main`.

## Tooling

Required local tools:

- Node.js 24 LTS for CI parity, or Node.js 22 or newer for local development
- pnpm 11 or newer
- Git
- GitHub CLI for PR publishing and merge operations

Install dependencies with:

```powershell
pnpm install
```

Generate the Prisma client when running typecheck, build, or database work directly:

```powershell
pnpm --filter @cohos/db prisma:generate
```

Root scripts call Prisma generation where it is required for lint and typecheck.

## Common Commands

Run both app dev servers:

```powershell
pnpm dev
```

Run the full validation set:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:forbidden-names
```

GitHub Actions runs the same validation set on `ubuntu-latest` with Node.js 24 and pnpm 11.10.0 after `pnpm install --frozen-lockfile`.

Run package-focused checks:

```powershell
pnpm --filter @cohos/domain build
pnpm --filter @cohos/api typecheck
pnpm --filter @cohos/web typecheck
pnpm test -- packages/domain/src/index.test.ts
```

Validate the Prisma schema:

```powershell
pnpm --filter @cohos/db prisma:validate
```

Seed a local PostgreSQL database:

```powershell
pnpm --filter @cohos/db seed
```

## Branch And PR Flow

Use one implementation branch per backlog ticket:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/OS-020-documentation-completion
```

Before committing, inspect the real diff and stage only intended files:

```powershell
git status -sb
git diff --name-only
git diff --stat
git add -- README.md docs/architecture.md
git diff --cached --check
```

Commit with a terse message, push, and open a PR:

```powershell
git commit -m "docs: complete MVP documentation set"
git push -u origin feat/OS-020-documentation-completion
gh pr create --base main --head feat/OS-020-documentation-completion --title "docs: complete MVP documentation set" --body-file .tmp-pr-body.md
```

After merge, sync local main:

```powershell
gh pr merge <number> --merge --delete-branch
git fetch origin main --prune
git switch main
git pull --ff-only origin main
```

## Documentation Rules

- Keep docs aligned with implemented behavior.
- Mark planned behavior as planned or deferred.
- Do not introduce forbidden legacy names.
- Do not add directly identifying sample data.
- Keep human examples pseudonymized.
- Prefer links to package, route, and script names over broad claims.
- Update `docs/backlog.md` with branch, validation, review, risks, PR, and merge details.

## Testing Strategy

Place focused tests near the package that owns the behavior:

- Domain validation in `packages/domain`.
- Audit and derived event state in `packages/audit`.
- Rules in `packages/rules`.
- ISA export shape in `packages/isa`.
- Connector contracts in `packages/connectors`.
- QR token semantics in `packages/qr`.
- Report descriptors and CSV in `packages/reporting`.
- API controller behavior in `apps/api`.
- Web formatters, navigation, and API client behavior in `apps/web`.

Avoid broad snapshots when a specific assertion will describe the invariant better.

## Known Local Noise

On Windows, Git can report files as modified because line endings would be normalized the next time Git writes them. Use `git diff --name-only` and `git diff --stat` to distinguish real content changes from line-ending metadata, and stage only the files that belong to the current ticket.
