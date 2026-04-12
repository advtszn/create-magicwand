import { Service } from "typedi";
import { SystemRouter } from "./routers/system.router";
import { UserRouter } from "./routers/user.router";
import type { IHttpApp } from "./types";

@Service()
export class Router {
  constructor(
    private readonly systemRouter: SystemRouter,
    private readonly userRouter: UserRouter,
  ) {}

  async init(path: string, app: IHttpApp): Promise<void> {
    await this.systemRouter.init(path, app);
    await this.userRouter.init(`${path}/user`, app);
  }
}
