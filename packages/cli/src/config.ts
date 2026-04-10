import { access, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { cancel, isCancel, select, text } from "@clack/prompts";
import type { CliArgs } from "./args";
import {
  BASE_TEMPLATES_DIR,
  DEFAULT_ALIAS,
  DEFAULT_TEMPLATE,
  DEFAULT_TOOLCHAIN,
  ENABLED_TEMPLATES,
  TOOLCHAINS,
} from "./constants";
import type { ResolvedConfig, Toolchain } from "./types";

export async function getAvailableTemplateIds(): Promise<string[]> {
  const entries = await readdir(BASE_TEMPLATES_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function resolveConfig(args: CliArgs): Promise<ResolvedConfig> {
  const availableTemplateIds = await getAvailableTemplateIds();
  const isInteractive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  const targetPath = args.targetPath
    ? args.targetPath
    : isInteractive
      ? await promptTargetPath()
      : fail(
          "Missing <target-path>. Run with a path or use the interactive wizard.",
        );

  const template = args.template
    ? args.template
    : isInteractive
      ? await promptTemplateFromWizard()
      : DEFAULT_TEMPLATE;

  const toolchainValue = args.toolchain
    ? args.toolchain
    : isInteractive
      ? await promptToolchain()
      : DEFAULT_TOOLCHAIN;

  const alias = args.alias
    ? args.alias
    : isInteractive
      ? await promptAlias()
      : DEFAULT_ALIAS;

  validateTemplate(template, availableTemplateIds);
  validateToolchain(toolchainValue);
  validateAlias(alias);

  const targetPathAbsolute = resolve(process.cwd(), targetPath);
  const projectName = basename(targetPathAbsolute);
  const packageName = normalizePackageName(projectName);

  if (!packageName) {
    throw new Error(
      `Could not derive a valid package name from target path "${targetPath}".`,
    );
  }

  const [runtime, library] = parseTemplate(template);

  return {
    alias,
    aliasImportPrefix: alias.slice(0, -1),
    library,
    packageName,
    projectName: packageName,
    runtime,
    targetPath,
    targetPathAbsolute,
    template,
    toolchain: toolchainValue,
  };
}

export async function ensureTemplateDirectoryExists(template: string) {
  const templateDirectory = resolve(BASE_TEMPLATES_DIR, template);
  await access(templateDirectory);
  return templateDirectory;
}

function validateTemplate(template: string, availableTemplateIds: string[]) {
  if (!availableTemplateIds.includes(template)) {
    throw new Error(
      `Unknown template "${template}". Available template directories: ${availableTemplateIds.join(", ") || "(none found)"}.`,
    );
  }

  if (
    !ENABLED_TEMPLATES.includes(template as (typeof ENABLED_TEMPLATES)[number])
  ) {
    throw new Error(
      `Template "${template}" exists but is not available in v1 yet. Enabled template: ${ENABLED_TEMPLATES.join(", ")}.`,
    );
  }
}

function validateToolchain(toolchain: string): asserts toolchain is Toolchain {
  if (!TOOLCHAINS.includes(toolchain as Toolchain)) {
    throw new Error(
      `Invalid toolchain "${toolchain}". Expected one of: ${TOOLCHAINS.join(", ")}.`,
    );
  }
}

function validateAlias(alias: string) {
  if (!alias.endsWith("/*")) {
    throw new Error(
      'Invalid alias. Expected a path pattern ending in "/*" (example: "~/*").',
    );
  }

  const withoutWildcard = alias.slice(0, -1);

  if (!withoutWildcard.endsWith("/")) {
    throw new Error(
      'Invalid alias. Expected a slash before the wildcard (example: "~/*").',
    );
  }

  if (alias.indexOf("*") !== alias.length - 1) {
    throw new Error(
      "Invalid alias. The wildcard must appear only once at the end.",
    );
  }
}

function parseTemplate(template: string): [string, string] {
  const parts = template.split("-");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid template "${template}". Expected a directory name like "bun-hono".`,
    );
  }

  return [parts[0], parts[1]];
}

function normalizePackageName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
}

async function promptTargetPath() {
  const value = await text({
    message: "Where should we create your project?",
    placeholder: "my-api",
    defaultValue: "my-api",
    validate(input) {
      if (!(input ?? "").trim()) {
        return "Target path is required.";
      }
    },
  });

  return unwrapPrompt<string>(value);
}

async function promptTemplateFromWizard() {
  const runtime = await select({
    message: "Runtime",
    options: [
      { value: "bun", label: "Bun", hint: "available in v1" },
      { value: "node", label: "Node", hint: "coming soon", disabled: true },
    ],
  });

  const resolvedRuntime = unwrapPrompt<string>(runtime);

  const library = await select({
    message: "Library",
    options: [
      { value: "hono", label: "Hono", hint: "available in v1" },
      {
        value: "express",
        label: "Express",
        hint: "coming soon",
        disabled: true,
      },
    ],
  });

  const resolvedLibrary = unwrapPrompt<string>(library);

  return `${resolvedRuntime}-${resolvedLibrary}`;
}

async function promptToolchain(): Promise<Toolchain> {
  const value = await select({
    message: "Toolchain",
    options: [
      {
        value: "biome",
        label: "Biome",
        hint: "recommended",
      },
      {
        value: "eslint-prettier",
        label: "ESLint + Prettier",
      },
      {
        value: "none",
        label: "None",
      },
    ],
  });

  return unwrapPrompt<Toolchain>(value);
}

async function promptAlias() {
  const value = await text({
    message: "Import alias",
    placeholder: DEFAULT_ALIAS,
    defaultValue: DEFAULT_ALIAS,
    validate(input) {
      try {
        validateAlias(input ?? "");
        return undefined;
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid alias.";
      }
    },
  });

  return unwrapPrompt<string>(value);
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }

  return value as T;
}

function fail(message: string): never {
  throw new Error(message);
}
