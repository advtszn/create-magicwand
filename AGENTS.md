# AGENTS.md

## Purpose
This file is for coding agents working inside `create-magicwand`.
Prefer small, targeted changes that fit the existing structure and toolchain.

## Repository Overview
- Package manager: `bun@1.3.10`
- Monorepo: Bun workspaces
- Main packages:
- `apps/www`: Next.js 16 marketing/docs site
- `packages/cli`: published `create-magicwand` CLI
- `packages/cli/templates/base/bun-hono`: scaffold template shipped by the CLI
- Root lint/format tool: Biome
- Git hook tool: Lefthook

## Source Of Truth
- Root scripts: `package.json`
- Formatting and lint rules: `biome.json`
- Git hooks: `lefthook.yml`
- Release flow: `.github/workflows/release.yml`
- Next app config: `apps/www/next.config.ts`
- Template conventions matter because the CLI copies `packages/cli/templates/**` into generated projects

## Cursor And Copilot Rules
- No `.cursorrules` file exists
- No `.cursor/rules/` directory exists
- No `.github/copilot-instructions.md` file exists
- Do not assume hidden editor-specific rules beyond what is in this repository

## Working Norms
- Use Bun commands, not npm/pnpm/yarn, unless the task explicitly requires another tool
- Prefer changing the smallest relevant package instead of touching unrelated workspace files
- If changing scaffold output, edit files under `packages/cli/templates/**`
- If changing generation behavior, inspect both `packages/cli/src/**` and the template files it copies
- Keep package boundaries intact: marketing app, CLI, and shipped template are separate concerns

## Install
Run from repo root:

```bash
bun install
```

## Verified Commands
These commands were checked against the repo state during AGENTS.md creation.

### Root Workspace
- Check formatting and lint for tracked files: `bun run check`
- Auto-fix with Biome: `bun run check:write`
- Current nuance: `bun run check` reports one Biome warning in `packages/cli/templates/base/bun-hono/src/interfaces/http/routes/users/user.route.ts`
- Warning type: `lint/correctness/noUnusedFunctionParameters`

### CLI Package
Run from `packages/cli`:

- Build CLI bundle: `bun run build`

Run from repo root:

- Dev invocation: `bun --cwd packages/cli run src/index.ts my-api`
- Alternate invocation: `bun --cwd packages/cli run src/index.ts ./apps/my-api --template bun-hono --toolchain eslint-prettier --alias "@/*"`

Build details:

- Bundles `src/index.ts` to `dist/cli.js`
- Targets Node and adds the `#!/usr/bin/env node` banner

### Next App
Run from `apps/www`:

- Start dev server: `bun run dev`
- Production build: `bun run build`
- Start production server: `bun run start`
- Lint script exists: `bun run lint`

Important:

- `bun run lint` currently fails because `apps/www` does not contain `eslint.config.js|mjs|cjs`
- Do not assume the app has a working standalone lint setup until that config is added
- Prefer root `bun run check` for repo-wide static checks

### Generated Bun + Hono Template
Run from `packages/cli/templates/base/bun-hono` only when working on the scaffold itself:

- Start HTTP dev server: `bun run dev:http`
- Build HTTP app: `bun run build:http`
- Start built HTTP app: `bun run start:http`
- Type-check template: `bun run typecheck`

## Test Status
- No test runner is configured at the workspace root
- No root `test` script exists
- No Jest, Vitest, or Playwright config exists in this repo
- No `*.test.*` or `*.spec.*` files were found during inspection

## Single-Test Command
- No single-test command exists today because no test framework is configured
- Do not invent unsupported test commands in this repo
- If you add tests, also add and document:
- a package-level `test` script
- a single-file test command
- any required config file

## Release Flow
The published CLI releases from GitHub Actions on version tags.

- Installs dependencies with `bun install --frozen-lockfile`
- Runs `bunx @biomejs/biome check .`
- Runs `bun run build` in `packages/cli`
- Verifies the git tag matches `packages/cli/package.json` version
- Publishes with `bun publish`

## Formatting Rules
Follow Biome first.

- Indentation: spaces
- JavaScript and TypeScript quote style: double quotes
- Imports are organized automatically by Biome assist
- Use trailing commas where Biome inserts them
- Keep file formatting Biome-compatible; do not hand-format against the formatter

## Import Conventions
- Prefer ESM imports everywhere
- Use `import type` only when the file already does so or it clearly improves readability; root Biome disables `useImportType`
- Node built-ins are imported via `node:` specifiers in CLI code
- In `apps/www`, use the path alias `@/*` for app source imports
- In generated Bun/Hono templates, the default alias is `~/*` unless generation config replaces it
- Keep external imports above internal imports, matching current files

## TypeScript Rules
- TypeScript is `strict` at the root and in the app; write code that satisfies strict typing
- Root config also enables `noUncheckedIndexedAccess` and `noImplicitOverride`
- Prefer explicit domain types and interfaces at module boundaries
- Use string-literal unions for constrained options when the repo already models them that way
- Avoid `any`; use `unknown` and narrow when needed
- Use `as const` for stable literal objects or return values when helpful
- Preserve readonly intent when it already exists

## Naming Conventions
- Use `camelCase` for variables, functions, and object properties
- Use `PascalCase` for React components, classes, and exported constructor-style abstractions
- Use `SCREAMING_SNAKE_CASE` for top-level constants that are true constants
- Template route files use dotted names like `health.system.route.ts`; preserve that pattern
- Prefer descriptive names over new abbreviations

## Code Structure
- Prefer small helper functions over deeply nested inline logic when it improves clarity
- Keep CLI parsing, config resolution, and generation concerns separated as they are now
- In the Bun/Hono template, preserve the layered split across `application`, `domain`, `infrastructure`, `interfaces`, and `shared`
- In Next app code, preserve the existing `src/app`, `src/components`, and `src/lib` structure

## Error Handling
- Throw `Error` objects with direct, actionable messages for invalid CLI input
- Narrow unknown errors before reading properties, as done in `isNotFoundError`
- At process entrypoints, convert thrown errors into user-facing logs and exit codes
- Reuse typed app errors in template code when handling HTTP failures
- Do not swallow errors silently; either handle them with context or rethrow them

## React And Next.js Notes
- `apps/www` uses React 19 and Next 16 with `reactCompiler: true`
- Follow existing component patterns before introducing new hooks or abstractions
- Use client components only where needed; keep server/default behavior when possible
- Reuse UI primitives from `src/components/ui` before adding one-off variants

## Agent Checklist Before Finishing
- Run the narrowest relevant command for the package you changed
- Run `bun run check` from the root when changes affect shared formatting or lint behavior
- If you add a new command, document it in the relevant package README and update this file if agent workflow changed
- If you add a test framework, update the `Test Status` and `Single-Test Command` sections immediately
