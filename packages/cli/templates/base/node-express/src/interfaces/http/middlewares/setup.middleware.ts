import { NextFunction, Request, Response } from "express";
import { Service } from "typedi";
import { ulid } from "ulid";
import { Logger } from "~/infrastructure/logger/logger.infrastructure";

@Service()
export default class SetupMiddleware {
  constructor(private readonly logger: Logger) {}

  async init() {
    return async (req: Request, res: Response, next: NextFunction) => {
      req.requestId = ulid();
      this.logger.general.debug({ requestId: req.requestId }, "Request setup");

      return next();
    };
  }
}
