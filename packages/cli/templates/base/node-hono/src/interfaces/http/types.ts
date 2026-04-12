import type { Context, Hono, MiddlewareHandler } from "hono";
import pino from "pino";

export interface IHttpVariables {
  requestId: string;
  logger: pino.Logger;
}

export interface IHttpBindings {
  Variables: IHttpVariables;
}

export type IHttpApp = Hono<IHttpBindings>;
export type IHttpContext = Context<IHttpBindings>;
export type IHttpMiddleware = MiddlewareHandler<IHttpBindings>;
