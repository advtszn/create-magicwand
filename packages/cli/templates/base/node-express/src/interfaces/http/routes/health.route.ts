import { Service } from "typedi";
import z from "zod";
import { Methods, RequestSchema, ResponseSchema, Route } from "../route";

@Service()
export class HealthRoute extends Route {
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
      handler: async () => ({
        success: true,
        data: {
          status: "ok" as const,
        },
      }),
    });
  }
}
