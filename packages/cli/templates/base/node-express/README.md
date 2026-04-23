# {{projectName}}

This is a layered backend for Node + Express bootstrapped with `create-magicwand`.

It gives you a pragmatic starting point with `domain`, `application`,
`infrastructure`, and `interfaces` layers already separated so you can ship
features without inventing the project structure first.

## Architecture

Use the scaffold as a baseline for backend features such as new use cases,
repositories, integrations, and HTTP routes.

Core layers:

- `src/domain`: business entities and domain rules
- `src/application`: use cases and application services
- `src/infrastructure`: adapters such as config, persistence, and logging
- `src/interfaces`: HTTP routes, controllers, and transport concerns
- `src/shared`: cross-cutting helpers and shared primitives

We keep the scaffold intentionally small, so you can extend it without having
to undo framework boilerplate later.

## Stack

If you are not familiar with the technologies used in this project, refer to the docs below:

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [Zod](https://zod.dev)
- [TypeDI](https://typedi.js.org)
- [Pino](https://getpino.io)

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev:http
```

Typecheck the project:

```bash
npm run typecheck
```

Build the project:

```bash
npm run build:http
```

The default health check is available at `GET /v1/health`.

From here, a typical next step is to add a new application use case, wire it to
an infrastructure dependency, and expose it through an HTTP route.

## How do I deploy this?

This scaffold transpiles to `dist/interfaces/http/index.js`, so you can deploy it anywhere Node apps can run. A common production flow is:

```bash
npm run build:http
npm run start:http
```
