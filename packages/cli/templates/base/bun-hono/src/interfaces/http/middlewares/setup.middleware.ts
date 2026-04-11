import { Service } from "typedi";
import { ulid } from "ulid";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";
import type { IHttpMiddleware } from "../types";

@Service()
export default class SetupMiddleware {
  constructor(private readonly logger: Logger) {}
  async init(): Promise<IHttpMiddleware> {
    return async (ctx, next) => {
      const requestId = ulid();
      ctx.set("requestId", requestId);
      ctx.set("logger", this.logger.general.child({ requestId }));

      ctx.header("X-Request-Id", requestId);

      await next();
    };
  }
}
