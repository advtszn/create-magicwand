# create-magicwand

CLI package for scaffolding layered backends with your preferred runtime and framework.

## Usage

```bash
create-magicwand <target-path> [options]
```

### Flags

- `--runtime <name>`
- `--framework <name>`
- `--template <name>`
- `--toolchain none|biome|eslint-prettier`
- `--alias <pattern>`

`--template` remains available as a direct override, but the primary interface is choosing a runtime and framework. In interactive mode, the wizard also asks whether to install dependencies and initialize a git repository.

### Examples

```bash
create-magicwand my-api
create-magicwand my-api --runtime node --framework hono
create-magicwand ./apps/my-api --runtime bun --framework hono --toolchain eslint-prettier --alias "@/*"
create-magicwand . --template node-hono
```

## Development

```bash
bun run dev
```

## Build

```bash
bun run build
```
