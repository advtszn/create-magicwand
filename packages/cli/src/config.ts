import { access, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { cancel, confirm, isCancel, select, text } from "@clack/prompts";
import type { CliArgs } from "./args";
import {
  BASE_TEMPLATES_DIR,
  DEFAULT_ALIAS,
  DEFAULT_FRAMEWORK,
  DEFAULT_RUNTIME,
  DEFAULT_TOOLCHAIN,
  ENABLED_TEMPLATES,
  FRAMEWORKS,
  RUNTIMES,
  TOOLCHAINS,
} from "./constants";
import type { Framework, ResolvedConfig, Runtime, Toolchain } from "./types";

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

  const [runtimeValue, frameworkValue] = args.template
    ? resolveRuntimeAndFrameworkFromTemplate(args.template)
    : args.runtime || args.framework
      ? [args.runtime ?? DEFAULT_RUNTIME, args.framework ?? DEFAULT_FRAMEWORK]
      : isInteractive
        ? await promptTemplateFromWizard()
        : [DEFAULT_RUNTIME, DEFAULT_FRAMEWORK];

  const runtime = runtimeValue as string;
  const framework = frameworkValue as string;
  const template = args.template ?? `${runtime}-${framework}`;

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

  const installDependencies = isInteractive
    ? await promptInstallDependencies()
    : false;

  const initGit = isInteractive ? await promptInitGit() : false;

  validateRuntime(runtime);
  validateFramework(framework);
  validateTemplate(template, availableTemplateIds);
  validateExplicitSelectionMatchesTemplate(args, runtime, framework);
  validateTemplateMatchesSelection(template, runtime, framework);
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

  return {
    alias,
    aliasImportPrefix: alias.slice(0, -1),
    framework,
    initGit,
    installDependencies,
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

function validateRuntime(runtime: string): asserts runtime is Runtime {
  if (!RUNTIMES.includes(runtime as Runtime)) {
    throw new Error(
      `Invalid runtime "${runtime}". Expected one of: ${RUNTIMES.join(", ")}.`,
    );
  }
}

function validateFramework(framework: string): asserts framework is Framework {
  if (!FRAMEWORKS.includes(framework as Framework)) {
    throw new Error(
      `Invalid framework "${framework}". Expected one of: ${FRAMEWORKS.join(", ")}.`,
    );
  }
}

function validateTemplateMatchesSelection(
  template: string,
  runtime: string,
  framework: string,
) {
  const expectedTemplate = `${runtime}-${framework}`;

  if (template !== expectedTemplate) {
    throw new Error(
      `Template "${template}" does not match runtime/framework selection "${expectedTemplate}".`,
    );
  }
}

function validateExplicitSelectionMatchesTemplate(
  args: CliArgs,
  runtime: string,
  framework: string,
) {
  if (args.runtime && args.runtime !== runtime) {
    throw new Error(
      `Runtime "${args.runtime}" does not match template "${args.template}".`,
    );
  }

  if (args.framework && args.framework !== framework) {
    throw new Error(
      `Framework "${args.framework}" does not match template "${args.template}".`,
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

function parseTemplate(template: string): [Runtime, Framework] {
  const parts = template.split("-");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid template "${template}". Expected a directory name like "bun-hono".`,
    );
  }

  const [runtime, framework] = parts;

  validateRuntime(runtime);
  validateFramework(framework);

  return [runtime, framework];
}

function resolveRuntimeAndFrameworkFromTemplate(template: string) {
  return parseTemplate(template);
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
      if (!resolveTextInput(input, "my-api")) {
        return "Target path is required.";
      }
    },
  });

  return resolveTextInput(unwrapPrompt<string>(value), "my-api");
}

async function promptTemplateFromWizard(): Promise<[Runtime, Framework]> {
  const runtime = await select({
    message: "Runtime",
    options: [
      { value: "bun", label: "Bun" },
      { value: "node", label: "Node" },
    ],
  });

  const resolvedRuntime = unwrapPrompt<Runtime>(runtime);

  const framework = await select({
    message: "Framework",
    options: [
      {
        value: "hono",
        label: "Hono",
      },
      {
        value: "express",
        label: "Express",
        disabled: true,
      },
    ],
  });

  const resolvedFramework = unwrapPrompt<Framework>(framework);

  return [resolvedRuntime, resolvedFramework];
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
        validateAlias(resolveTextInput(input, DEFAULT_ALIAS));
        return undefined;
      } catch (error) {
        return error instanceof Error ? error.message : "Invalid alias.";
      }
    },
  });

  return resolveTextInput(unwrapPrompt<string>(value), DEFAULT_ALIAS);
}

async function promptInstallDependencies() {
  const value = await confirm({
    message: "Install dependencies?",
    initialValue: true,
  });

  return unwrapPrompt<boolean>(value);
}

async function promptInitGit() {
  const value = await confirm({
    message: "Initialize a git repository?",
    initialValue: true,
  });

  return unwrapPrompt<boolean>(value);
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }

  return value as T;
}

function resolveTextInput(
  input: string | undefined,
  defaultValue: string,
): string {
  const trimmed = (input ?? "").trim();
  return trimmed || defaultValue;
}

function fail(message: string): never {
  throw new Error(message);
}
