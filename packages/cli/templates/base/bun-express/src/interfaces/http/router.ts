import { Application } from "express";
import { Service } from "typedi";
import { HealthRouter } from "./routers/health.router";
import { UserRouter } from "./routers/user.router";

@Service()
export class Router {
  constructor(
    private readonly healthRouter: HealthRouter,
    private readonly userRouter: UserRouter,
  ) {}

  async init(path: string, app: Application) {
    await this.healthRouter.init(path, app);
    await this.userRouter.init(`${path}/user`, app);
  }
}
