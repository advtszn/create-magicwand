# Contributing

Thanks for contributing to `create-magicwand`.

## Before you start

- Read the root `README.md` for repository structure and common commands.
- Keep changes small and focused.
- Prefer updating the narrowest package or template that solves the problem.

## Local setup

Requirements:

- Bun `1.3.10`
- Node `18+`

Install dependencies from the repository root:

```bash
bun install
```

## Development workflow

### CLI work

Build the CLI:

```bash
bun --cwd packages/cli run build
```

Run the CLI directly in development:

```bash
bun --cwd packages/cli run src/index.ts my-api
```

### Website work

Start the marketing site:

```bash
bun --cwd apps/www run dev
```

### Template work

If a change affects generated output, update the matching files under:

```text
packages/cli/templates/
```

If a change affects CLI generation behavior, review both:

- `packages/cli/src/**`
- `packages/cli/templates/**`

## Checks

Run the repo checks before opening a pull request:

```bash
bun run check
```

Auto-fix supported issues with:

```bash
bun run check:write
```

## Pull requests

When opening a pull request:

- describe the user-facing change clearly
- include any template, CLI, or docs updates needed for consistency
- keep unrelated edits out of the branch
- mention any known limitations or follow-up work

## Releases

Releases publish from GitHub Actions on version tags. Update
`packages/cli/package.json`, commit the version change, create a matching tag,
and push both branch and tag.

## Questions

If you are unsure where a change belongs, open an issue or start a draft pull
request with the proposed direction.
