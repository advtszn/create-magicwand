import { fileURLToPath } from "node:url";

import type { Framework, Runtime } from "./types";

export const DEFAULT_RUNTIME: Runtime = "bun";
export const DEFAULT_FRAMEWORK: Framework = "hono";
export const DEFAULT_TEMPLATE = `${DEFAULT_RUNTIME}-${DEFAULT_FRAMEWORK}`;
export const DEFAULT_TOOLCHAIN = "biome";
export const DEFAULT_ALIAS = "~/*";

export const RUNTIMES = ["bun", "node"] as const;
export const FRAMEWORKS = ["hono", "express"] as const;
export const ENABLED_TEMPLATES = ["bun-hono", "node-hono"] as const;
export const TOOLCHAINS = ["none", "biome", "eslint-prettier"] as const;

export const BASE_TEMPLATES_DIR = fileURLToPath(
  new URL("../templates/base", import.meta.url),
);
export const TOOLCHAIN_TEMPLATES_DIR = fileURLToPath(
  new URL("../templates/extras/toolchain", import.meta.url),
);
