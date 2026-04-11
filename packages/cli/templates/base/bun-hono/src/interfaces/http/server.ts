import { Hono } from "hono";
import { cors } from "hono/cors";
import { pinoLogger } from "hono-pino";
import { Service } from "typedi";
import { Env } from "~/infrastructure/config/env.config";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";
import SetupMiddleware from "./middlewares/setup.middleware";
import { Router } from "./router";
import type { IHttpApp } from "./types";

@Service()
export class Server {
  constructor(
    private readonly logger: Logger,
    private readonly env: Env,
    private readonly setupMiddleware: SetupMiddleware,
    private readonly router: Router,
  ) {}

  async init(): Promise<void> {
    this.logger.general.info("Initializing server...");

    const app: IHttpApp = new Hono();

    app.use("*", cors());
    app.use("*", await this.setupMiddleware.init());
    app.use(
      "*",
      pinoLogger({
        pino: this.logger.http,
        http: {
          referRequestIdKey: "requestId",
        },
      }),
    );

    await this.router.init("/v1", app);
    await this.start(app);
  }

  private async start(app: IHttpApp): Promise<void> {
    const server = Bun.serve({
      fetch: app.fetch,
      port: this.env.data.PORT,
      hostname: "0.0.0.0",
    });

    this.logger.general.info(
      `Server listening on http://${server.hostname}:${server.port}`,
    );
  }
}
