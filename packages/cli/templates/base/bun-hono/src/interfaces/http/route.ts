import { Hono } from "hono";
import z from "zod";
import { AppError, BadRequestError } from "~/shared/errors/http.errors";
import type { IHttpApp, IHttpContext } from "./types";

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
		query: (args?.query ?? z.object({})) as TQuery,
		params: (args?.params ?? z.object({})) as TParams,
		headers: (args?.headers ?? z.object({})) as THeaders,
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
};

type RouteHandler<
	TRequestSchema extends AnyRequestSchema,
	TResponseSchema extends AnyResponseSchema,
> = (
	params: RequestContext<TRequestSchema>,
) => Promise<z.infer<TResponseSchema>>;

export abstract class Route {
	private readonly router: IHttpApp;
	private initialized = false;

	constructor() {
		this.router = new Hono();
	}

	protected abstract setupRoutes(): void;

	async init(): Promise<IHttpApp> {
		if (!this.initialized) {
			this.setupRoutes();
			this.initialized = true;
		}

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
		const routeHandler = this.processRequest(requestSchema, responseSchema, handler);

		switch (method) {
			case Methods.GET:
				this.router.get(path, routeHandler);
				return;
			case Methods.POST:
				this.router.post(path, routeHandler);
				return;
			case Methods.PUT:
				this.router.put(path, routeHandler);
				return;
			case Methods.PATCH:
				this.router.patch(path, routeHandler);
				return;
			case Methods.DELETE:
				this.router.delete(path, routeHandler);
				return;
		}
	}

	private processRequest<
		TRequestSchema extends AnyRequestSchema,
		TResponseSchema extends AnyResponseSchema,
	>(
		requestSchema: TRequestSchema,
		responseSchema: TResponseSchema,
		handler: RouteHandler<TRequestSchema, TResponseSchema>,
	) {
		return async (ctx: IHttpContext) => {
			let data: z.infer<TRequestSchema>;

			try {
				data = await requestSchema.parseAsync({
					body: await this.parseBody(ctx),
					query: ctx.req.query(),
					params: ctx.req.param(),
					headers: this.getHeaders(ctx),
				});
			} catch (error) {
				const message = this.getValidationMessage(error);
				const result = {
					success: false,
					error: { message },
				};

				return ctx.json(result, 400);
			}

			let result: z.infer<TResponseSchema>;

			try {
				result = await handler({
					data,
				});

				result = await responseSchema.parseAsync(result);
			} catch (error) {
				const statusCode = error instanceof AppError ? error.statusCode : 500;
				const result = {
					success: false,
					error: {
						message:
							error instanceof Error ? error.message : "Internal server error",
					},
				};

				return this.respond(ctx, result, statusCode);
			}

			const statusCode = result.success ? 200 : 400;

			return this.respond(ctx, result, statusCode);
		};
	}

	private respond(ctx: IHttpContext, body: unknown, statusCode: number) {
		ctx.status(statusCode as never);
		return ctx.json(body);
	}

	private async parseBody(ctx: IHttpContext): Promise<unknown> {
		const contentType = ctx.req.header("content-type") ?? "";

		if (!contentType.includes("application/json")) {
			return undefined;
		}

		const rawBody = await ctx.req.text();

		if (!rawBody) {
			return undefined;
		}

		try {
			return JSON.parse(rawBody);
		} catch {
			throw new BadRequestError("body: Invalid JSON body");
		}
	}

	private getHeaders(ctx: IHttpContext): Record<string, string> {
		return Object.fromEntries(ctx.req.raw.headers.entries());
	}

	private getValidationMessage(error: unknown): string {
		if (error instanceof z.ZodError) {
			return error.issues
				.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
				.join("; ");
		}

		if (error instanceof Error) {
			return error.message;
		}

		return "Invalid request";
	}
}
