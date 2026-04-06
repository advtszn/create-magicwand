# create-magicwand

This repository is a Bun workspace with a publishable CLI package in `packages/cli`

## Install

```bash
bun install
```

## Run the CLI in dev

```bash
bun run dev:cli
```

## Build the CLI

```bash
bun run build:cli
```

The published CLI remains Node-compatible and is bundled from `packages/cli/src/index.ts` to `packages/cli/dist/cli.js`.
