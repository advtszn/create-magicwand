import { Application } from "express";
import { Service } from "typedi";
import { HealthRoute } from "../routes/health.route";

@Service()
export class HealthRouter {
  constructor(private readonly healthRoute: HealthRoute) {}

  async init(path: string, app: Application): Promise<void> {
    app.use(path, await this.healthRoute.init());
  }
}
