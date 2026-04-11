import { Service } from "typedi";
import { UserRoute } from "../routes/users/user.route";
import type { IHttpApp } from "../types";

@Service()
export class UserRouter {
  constructor(private readonly userRoute: UserRoute) {}

  async init(path: string, app: IHttpApp): Promise<void> {
    app.route(path, await this.userRoute.init());
  }
}
