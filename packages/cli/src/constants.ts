import { fileURLToPath } from "node:url";

export const DEFAULT_TEMPLATE = "bun-hono";
export const DEFAULT_TOOLCHAIN = "biome";
export const DEFAULT_ALIAS = "~/*";

export const ENABLED_TEMPLATES = ["bun-hono"] as const;
export const TOOLCHAINS = ["none", "biome", "eslint-prettier"] as const;

export const BASE_TEMPLATES_DIR = fileURLToPath(
  new URL("../templates/base", import.meta.url),
);
export const TOOLCHAIN_TEMPLATES_DIR = fileURLToPath(
  new URL("../templates/extras/toolchain", import.meta.url),
);
