import type { Context, Hono, MiddlewareHandler } from "hono";

export interface IHttpVariables {
	requestId: string;
}

export interface IHttpBindings {
	Variables: IHttpVariables;
}

export type IHttpApp = Hono<IHttpBindings>;
export type IHttpContext = Context<IHttpBindings>;
export type IHttpMiddleware = MiddlewareHandler<IHttpBindings>;
