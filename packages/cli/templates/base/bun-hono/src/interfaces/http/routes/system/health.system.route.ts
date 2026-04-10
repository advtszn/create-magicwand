import z from "zod";
import { Service } from "typedi";
import { Methods, RequestSchema, ResponseSchema, Route } from "../../route";

@Service()
export class SystemHealthRoute extends Route {
	setupRoutes(): void {
		this.register({
			method: Methods.GET,
			path: "/health",
			requestSchema: RequestSchema(),
			responseSchema: ResponseSchema({
				data: z.object({
					status: z.literal("ok"),
				}),
			}),
				handler: async () => {
					return {
						success: true as const,
					data: {
						status: "ok" as const,
					},
					};
				},
		});
	}
}
