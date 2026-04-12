# create-magicwand

CLI for scaffolding pragmatic layered DDD backends in your preferred runtime and framework.

## Install

```bash
bun install
```

## Run the CLI in dev

```bash
bun --cwd packages/cli run src/index.ts my-api
bun --cwd packages/cli run src/index.ts my-api --runtime node --framework hono
bun --cwd packages/cli run src/index.ts ./apps/my-api --runtime bun --framework hono --toolchain eslint-prettier --alias "@/*"
```

## Build the CLI

```bash
bun --cwd packages/cli run build
```

## Release the CLI

The package publishes from GitHub Actions when you push a version tag.

1. Update `packages/cli/package.json` to the release version.
2. Commit that version bump on `main`.
3. Create an annotated tag that matches the package version.
4. Push `main` and the tag.

```bash
git commit -m "release 0.0.2"
git tag -a v0.0.2 -m "Release v0.0.2"
git push origin main
git push origin v0.0.2
```

The release workflow installs dependencies, runs `bunx @biomejs/biome check .`, builds the CLI from `packages/cli`, verifies the tag matches `packages/cli/package.json`, and then runs `bun publish` from `packages/cli`.

Set `NPM_TOKEN` in the GitHub repository secrets before using the workflow.

## v1 behavior

- enabled templates: `bun-hono`, `node-hono`
- interactive wizard asks for runtime + framework, then resolves to the template id
- interactive wizard also asks whether to install dependencies and initialize git
- non-interactive usage accepts `--runtime <name>` + `--framework <name>` or `--template <directory-name>`
- supported toolchains:
  - `none`
  - `biome`
  - `eslint-prettier`
- default alias: `~/*`
- target path must not already contain files

The published CLI remains Node-compatible and is bundled from `packages/cli/src/index.ts` to `packages/cli/dist/cli.js`.
