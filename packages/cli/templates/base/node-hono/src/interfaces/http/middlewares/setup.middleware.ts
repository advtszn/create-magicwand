import { Service } from "typedi";
import { ulid } from "ulid";
import type { IHttpMiddleware } from "../types";

@Service()
export default class SetupMiddleware {
  async init(): Promise<IHttpMiddleware> {
    return async (ctx, next) => {
      const requestId = ulid();
      ctx.set("requestId", requestId);

      ctx.header("X-Request-Id", requestId);

      await next();
    };
  }
}
