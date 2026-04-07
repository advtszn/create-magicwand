# Create Magicwand template system design

Date: 2026-04-07

## Goal

Design a composable template system for `create-magicwand` that scaffolds a pragmatic layered DDD backend while allowing users to customize:

- HTTP library: `express`, `hono`
- Runtime: `node`, `bun`
- Toolchain: `biome`, `eslint+prettier`
- Git hooks: `lefthook`, `husky`

The generated projects must keep the same architectural shape across all combinations.

## Decisions

### Fixed architecture

All generated projects use the same layered DDD structure:

```text
src/
  application/
  domain/
  infrastructure/
  interfaces/http/
  shared/
```

The base scaffold is "backend-ready", not minimal:

- env configuration
- logger abstraction/infrastructure
- DI with `typedi`
- `reflect-metadata`
- one repository interface example
- one use case/service example
- shared error primitives
- health endpoint example

### Template composition model

Use a manifest-driven overlay system instead of maintaining one full scaffold per matrix combination.

Template application order:

```text
base -> http -> runtime -> toolchain -> git-hooks -> variants
```

Recommended template tree:

```text
templates/
  base/
    files/
    template.json
    package.fragment.json
  http/
    hono/
      files/
      template.json
      package.fragment.json
    express/
      files/
      template.json
      package.fragment.json
  runtime/
    bun/
      files/
      template.json
      package.fragment.json
    node/
      files/
      template.json
      package.fragment.json
  toolchain/
    biome/
      files/
      template.json
      package.fragment.json
    eslint-prettier/
      files/
      template.json
      package.fragment.json
  git-hooks/
    lefthook/
      files/
      template.json
      package.fragment.json
    husky/
      files/
      template.json
      package.fragment.json
  variants/
    hono-bun/
      files/
      template.json
      package.fragment.json
    hono-node/
      files/
      template.json
      package.fragment.json
    express-bun/
      files/
      template.json
      package.fragment.json
    express-node/
      files/
      template.json
      package.fragment.json
```

## Why overlays instead of full matrix templates

The selection matrix already creates 16 combinations. Full per-combination templates would make maintenance expensive and error-prone. A manifest-driven overlay approach keeps the architecture stable and isolates stack differences to small, reviewable layers.

This also lets `hono-starter` act as a seed/reference project without making the generator depend on full project copies.

## Layer ownership

### `base`

Owns everything invariant across all combinations:

- layered DDD folder structure
- shared application/domain examples
- env abstraction
- logger infrastructure and abstractions
- shared errors
- base `tsconfig.json`
- `.env.example`
- README template
- invariant dependencies like:
  - `typedi`
  - `reflect-metadata`
  - `zod`
  - `@t3-oss/env-core`
  - `pino`
  - `ulid`

### `http/*`

Owns framework-specific HTTP adapter code:

- framework router/bootstrap adapters
- request/response plumbing
- route registration details
- HTTP types and middleware contracts

Business logic in `application/` and `domain/` stays framework-agnostic.

### `runtime/*`

Owns runtime-specific behavior:

- scripts
- runtime dependencies
- startup/build conventions
- native runtime ergonomics

Runtime choices:

- `node` uses `tsnd`
- `bun` uses native Bun commands

### `toolchain/*`

Owns formatting/linting setup:

- `biome`
- `eslint+prettier`

### `git-hooks/*`

Owns git hook configuration:

- `lefthook`
- `husky`

### `variants/*`

Own only the files that must differ for specific HTTP + runtime pairs.

This is important because runtime-aware HTTP bootstraps are legitimately different:

- Hono + Bun should feel Bun-native, including `Bun.serve(...)`
- Bun-based Express scaffolds should still follow Bun’s Express guidance and Bun CLI usage
- Node-based combinations should keep Node-native startup behavior

## Manifest format

Each template folder includes a small manifest:

```json
{
  "name": "http-hono",
  "kind": "http",
  "requires": [],
  "compatibleWith": {
    "runtime": ["bun", "node"]
  },
  "overrides": [
    "src/interfaces/http/index.ts",
    "src/interfaces/http/server.ts"
  ]
}
```

Suggested manifest semantics:

- `name`: unique template identifier
- `kind`: `base | http | runtime | toolchain | git-hooks | variant`
- `requires`: required templates if any
- `compatibleWith`: compatibility rules
- `overrides`: files this layer is allowed to replace

The generator should rely on fixed application order rather than complicated priority systems unless future complexity requires it.

## Merge rules

### File handling

- Copy all files from each template layer in apply order
- Replace simple `{{token}}` placeholders
- Later layers may only overwrite files if explicitly allowed through `overrides`
- Variants are the primary place where intentional overrides happen

### JSON handling

Support deep merge for:

- `package.json`
- optionally `tsconfig.json` if needed

For `package.json`:

- merge dependency maps by package name
- merge scripts by script key
- dedupe arrays when merging arrays that should behave as unions

### Non-goals for v1

Do not support arbitrary text patching or logic-heavy templating. In v1 a layer either:

- owns a file, or
- replaces a file wholesale

This keeps generation predictable and easier to debug.

## Token replacement

Use simple placeholders only:

```text
{{projectName}}
{{packageName}}
{{appName}}
{{port}}
```

Do not add conditional blocks or a full templating engine in v1.

## CLI flow

Prompt flow:

1. project name
2. runtime: `bun | node`
3. HTTP library: `hono | express`
4. toolchain: `biome | eslint-prettier`
5. git hooks: `lefthook | husky`
6. output directory

Derived values:

- `variantId = ${http}-${runtime}`
- token bag for placeholders

Recommended internal modules:

- `collect-config.ts`
- `resolve-templates.ts`
- `validate-combination.ts`
- `render-template.ts`
- `merge-package-json.ts`
- `write-project.ts`

Generation flow:

1. collect config
2. resolve base + selected overlays + variant
3. validate manifests and compatibility
4. stage output in memory
5. copy files in apply order
6. replace tokens
7. merge `package.fragment.json` files into final `package.json`
8. write output
9. print next steps

The CLI should also print a generation summary showing:

- selected layers
- overridden files
- key scripts/dependencies added

## Extracting from `hono-starter`

Use `hono-starter` as the initial reference for carving the first working template path.

Recommended extraction split:

- move invariant pieces into `base`
- move Hono-specific HTTP adapter code into `http/hono`
- move Bun-specific runtime behavior into `runtime/bun`
- keep `Bun.serve(...)` and any combo-specific entrypoint overrides in `variants/hono-bun`

This gives a clean first implementation target:

- `hono + bun + biome + lefthook`

Then add the remaining layers incrementally.

## Error handling

Fail fast when:

- two non-variant layers try to own the same file
- a manifest is missing or malformed
- a selected combination is incompatible
- unresolved `{{...}}` placeholders remain after rendering
- required files/fragments are absent

The generator should prefer explicit failures over silently producing broken projects.

## Testing strategy

Prioritize fixture-based golden tests.

Initial coverage should include at least these combinations:

- `hono + bun + biome + lefthook`
- `hono + node + eslint-prettier + husky`
- `express + bun + biome + husky`
- `express + node + eslint-prettier + lefthook`

Per test:

1. generate to a temp directory
2. snapshot or inspect file tree
3. assert key files exist
4. assert merged `package.json`
5. run `typecheck`
6. run a smoke startup command where practical

## Rollout plan

Implement in this order:

1. build the template engine and manifest reader
2. extract the first path from `hono-starter` into:
   - `base`
   - `http/hono`
   - `runtime/bun`
   - `variants/hono-bun`
3. make `hono + bun + biome + lefthook` fully working
4. add `runtime/node`
5. add `http/express`
6. add both toolchain options
7. add both git hook options
8. add fixture tests for representative combinations

This keeps one valid path working throughout development instead of trying to land the full matrix at once.
