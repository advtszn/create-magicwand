import cors from "cors";
import express, { type Application, json, urlencoded } from "express";
import { Service } from "typedi";
import { Env } from "~/infrastructure/config/env.config";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";
import SetupMiddleware from "./middlewares/setup.middleware";
import { Router } from "./router";

@Service()
export class Server {
  constructor(
    private readonly logger: Logger,
    private readonly env: Env,
    private readonly setupMiddleware: SetupMiddleware,
    private readonly router: Router,
  ) {}

  async init() {
    this.logger.general.info("Initializing server...");

    const app = express();

    app.set("trust proxy", 1);
    app.use(json({ limit: "10mb" }));
    app.use(urlencoded({ extended: true, limit: "10mb" }));
    app.use(cors());
    app.use(await this.setupMiddleware.init());
    app.use(this.logger.http);

    await this.router.init("/v1", app);

    await this.start(app);
  }

  private async start(app: Application) {
    const port = this.env.data.PORT;

    app.listen(port, () => {
      this.logger.general.info(`Server listening on http://0.0.0.0:${port}`);
    });
  }
}
