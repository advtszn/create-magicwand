# create-magicwand

CLI package for generating Magicwand projects.

## Usage

```bash
create-magicwand <target-path> [options]
```

### Flags

- `--template <name>`
- `--toolchain none|biome|eslint-prettier`
- `--alias <pattern>`

In interactive mode, the wizard also asks whether to install dependencies and initialize a git repository.

### Examples

```bash
create-magicwand my-api --template bun-hono
create-magicwand ./apps/my-api --template bun-hono --toolchain eslint-prettier --alias "@/*"
create-magicwand . --template bun-hono
```

## Development

```bash
bun run dev
```

## Build

```bash
bun run build
```
