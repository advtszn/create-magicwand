# create-magicwand

CLI for scaffolding pragmatic layered DDD backends.

## Install

```bash
bun install
```

## Run the CLI in dev

```bash
bun run dev:cli -- my-api
bun run dev:cli -- ./apps/my-api --template bun-hono --toolchain eslint-prettier --alias "@/*"
```

## Build the CLI

```bash
bun run build:cli
```

## v1 behavior

- one enabled template: `bun-hono`
- interactive wizard asks for runtime + library, then resolves to the template id
- interactive wizard also asks whether to install dependencies and initialize git
- non-interactive usage takes `--template <directory-name>`
- supported toolchains:
  - `none`
  - `biome`
  - `eslint-prettier`
- default alias: `~/*`
- target path must not already contain files

The published CLI remains Node-compatible and is bundled from `packages/cli/src/index.ts` to `packages/cli/dist/cli.js`.
