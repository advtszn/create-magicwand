# create-magicwand

Contributor docs for the `create-magicwand` monorepo.

`create-magicwand` is a CLI for scaffolding layered backends. This
repository contains the published CLI, the shipped project templates, and the
marketing site.

## Repository layout

- `packages/cli`: published `create-magicwand` CLI
- `packages/cli/templates/base`: scaffold templates copied into generated apps
- `apps/www`: Next.js marketing site for the project

## Requirements

- Bun `1.3.10`
- Node `18+`

## Install

```bash
bun install
```

## Common commands

Run from the repository root unless noted otherwise.

### Check formatting and lint

```bash
bun run check
```

### Auto-fix formatting and lint

```bash
bun run check:write
```

### Build the CLI

```bash
bun --cwd packages/cli run build
```

### Run the CLI in development

```bash
bun --cwd packages/cli run src/index.ts my-api
bun --cwd packages/cli run src/index.ts my-api --runtime node --framework hono
bun --cwd packages/cli run src/index.ts ./apps/my-api --runtime bun --framework hono --toolchain eslint-prettier --alias "@/*"
```

### Run the website locally

```bash
bun --cwd apps/www run dev
```

## Working on templates

If you change scaffold output, edit files under `packages/cli/templates/**`.
If you change generation behavior, inspect both `packages/cli/src/**` and the
template files it copies.

Current shipped base templates:

- `bun-hono`
- `node-hono`

## Release flow

The npm package publishes from GitHub Actions when you push a version tag.

1. Update `packages/cli/package.json` to the release version.
2. Commit the release changes on `main`.
3. Create an annotated tag that matches the package version.
4. Push `main` and the tag.

```bash
git commit -m "release 0.0.4"
git tag -a v0.0.4 -m "Release v0.0.4"
git push origin main
git push origin v0.0.4
```

The release workflow:

- installs dependencies with `bun install --frozen-lockfile`
- runs `bunx @biomejs/biome check .`
- builds the CLI from `packages/cli`
- verifies the git tag matches `packages/cli/package.json`
- publishes from `packages/cli` with `bun publish`

## Contributing

Start with `CONTRIBUTING.md` for setup, workflow, and expectations.

Related docs:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`

## License

MIT. See `LICENSE`.
