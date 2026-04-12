import { Application } from "express";
import { Service } from "typedi";
import { UserRoute } from "../routes/users/user.route";

@Service()
export class UserRouter {
  constructor(private readonly userRoute: UserRoute) {}

  async init(path: string, app: Application): Promise<void> {
    app.use(path, await this.userRoute.init());
  }
}
