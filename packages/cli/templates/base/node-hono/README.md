# {{projectName}}

This is a Node + Hono API project bootstrapped with `create-magicwand`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with the scaffold we set up for you and add more structure only when you need it.

If you are not familiar with the technologies used in this project, refer to the docs below:

- [Node.js](https://nodejs.org)
- [Hono](https://hono.dev)
- [Zod](https://zod.dev)
- [TypeDI](https://typedi.js.org)
- [Pino](https://getpino.io)

## Development

Install dependencies:

```bash
bun install
```

Start the dev server:

```bash
bun run dev:http
```

Typecheck the project:

```bash
bun run typecheck
```

Build the project:

```bash
bun run build:http
```

The default health check is available at `GET /v1/system/health`.

## How do I deploy this?

This scaffold transpiles to `dist/interfaces/http/index.js`, so you can deploy it anywhere Node apps can run. A common production flow is:

```bash
bun run build:http
bun run start:http
```
