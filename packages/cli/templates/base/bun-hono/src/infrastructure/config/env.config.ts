import { createEnv } from "@t3-oss/env-core";
import { Service } from "typedi";
import { z } from "zod";
import { Logger } from "../logger/logger.infrastructure";

const runtimeEnvSchema = z.object({
  APP_NAME: z.string().min(1).default("hono-starter"),
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
    this.data = createEnv({
      server: runtimeEnvSchema.shape,
      runtimeEnv: process.env,
      emptyStringAsUndefined: true,
      skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    });
  }
}
