import { Service } from "typedi";
import { SystemHealthRoute } from "../routes/system/health.system.route";
import type { IHttpApp } from "../types";

@Service()
export class SystemRouter {
  constructor(private readonly systemHealthRoute: SystemHealthRoute) {}

  async init(path: string, app: IHttpApp): Promise<void> {
    app.route(path, await this.systemHealthRoute.init());
  }
}
