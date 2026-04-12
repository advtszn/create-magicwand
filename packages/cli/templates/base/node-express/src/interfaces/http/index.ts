import "reflect-metadata";
import "dotenv/config";

import Container, { Service } from "typedi";
import { Env } from "~/infrastructure/config/env.config";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";
import { Server } from "./server";

@Service()
class Index {
  constructor(
    private readonly logger: Logger,
    private readonly env: Env,
    private readonly server: Server,
  ) {}

  async init() {
    await this.logger.init();
    await this.env.init();
    await this.server.init();
  }
}

Container.get(Index).init();
