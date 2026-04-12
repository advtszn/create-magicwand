import { Service } from "typedi";
import { z } from "zod";
import { Logger } from "../logger/logger.infrastructure";

const runtimeEnvSchema = z.object({
  APP_NAME: z.string().min(1).default("node-hono"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

type IEnvData = z.infer<typeof runtimeEnvSchema>;

@Service()
export class Env {
  data!: IEnvData;

  constructor(private readonly logger: Logger) {}

  async init(): Promise<void> {
    this.logger.general.info("Initializing environment variables...");

    const rawEnv = {
      APP_NAME: process.env.APP_NAME,
      PORT: process.env.PORT,
      LOG_LEVEL: process.env.LOG_LEVEL,
    };

    if (process.env.SKIP_ENV_VALIDATION) {
      this.data = runtimeEnvSchema.parse({
        APP_NAME: rawEnv.APP_NAME ?? "node-hono",
        PORT: rawEnv.PORT ?? 3000,
        LOG_LEVEL: rawEnv.LOG_LEVEL ?? "info",
      });

      return;
    }

    this.data = runtimeEnvSchema.parse(rawEnv);
  }
}
