import { Request, RequestHandler, Response, Router } from "express";
import { Logger } from "pino";
import z from "zod";
import { AppError } from "~/shared/errors/http.errors";

export enum Methods {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export const RequestSchema = <
  TBody extends z.ZodType = z.ZodUndefined,
  TQuery extends z.ZodType = z.ZodUndefined,
  TParams extends z.ZodType = z.ZodUndefined,
  THeaders extends z.ZodType = z.ZodUndefined,
>(args?: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  headers?: THeaders;
}) => {
  return z.object({
    body: (args?.body ?? z.undefined()) as TBody,
    query: (args?.query ?? z.object()) as TQuery,
    params: (args?.params ?? z.object()) as TParams,
    headers: (args?.headers ?? z.object()) as THeaders,
  });
};

export const ResponseSchema = <TData extends z.ZodType = z.ZodNull>(args?: {
  data?: TData;
}) => {
  return z.discriminatedUnion("success", [
    z
      .object({
        success: z.literal(true),
        data: (args?.data ?? z.null()) as TData,
      })
      .strict(),
    z
      .object({
        success: z.literal(false),
        error: z.object({ message: z.string() }).strict(),
      })
      .strict(),
  ]);
};

type AnyRequestSchema = ReturnType<typeof RequestSchema>;
type AnyResponseSchema = ReturnType<typeof ResponseSchema>;

export type RequestContext<TRequestSchema extends AnyRequestSchema> = {
  data: z.infer<TRequestSchema>;
  logger: Logger;
};

type RouteHandler<
  TRequestSchema extends AnyRequestSchema,
  TResponseSchema extends AnyResponseSchema,
> = (
  params: RequestContext<TRequestSchema>,
) => Promise<z.infer<TResponseSchema>>;

export abstract class Route {
  private router = Router();

  protected abstract setupRoutes(): void;

  async init(): Promise<Router> {
    this.setupRoutes();

    return this.router;
  }

  protected register<
    TRequestSchema extends AnyRequestSchema,
    TResponseSchema extends AnyResponseSchema,
  >({
    method,
    path,
    requestSchema,
    responseSchema,
    handler,
  }: {
    method: Methods;
    path: string;
    requestSchema: TRequestSchema;
    responseSchema: TResponseSchema;
    handler: RouteHandler<TRequestSchema, TResponseSchema>;
  }) {
    const handlers: RequestHandler[] = [];

    handlers.push(this.processRequest(requestSchema, responseSchema, handler));

    this.router[method](path, ...handlers);
  }

  private processRequest<
    TRequestSchema extends AnyRequestSchema,
    TResponseSchema extends AnyResponseSchema,
  >(
    requestSchema: TRequestSchema,
    _responseSchema: TResponseSchema,
    handler: RouteHandler<TRequestSchema, TResponseSchema>,
  ): RequestHandler {
    return async (req: Request, res: Response) => {
      const logger = (req as Request & { log: Logger }).log;
      let data: z.infer<TRequestSchema>;
      try {
        data = await requestSchema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
          headers: req.headers,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            error: {
              message: error.issues
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("; "),
            },
          });
        }
        throw error;
      }
      let result: z.infer<TResponseSchema>;
      try {
        result = await handler({ data, logger });
      } catch (error) {
        const statusCode = error instanceof AppError ? error.statusCode : 500;
        const result = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };

        return res.status(statusCode).json(result);
      }

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.json(result);
    };
  }
}
