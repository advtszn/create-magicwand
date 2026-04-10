import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spinner } from "@clack/prompts";
import { ensureTemplateDirectoryExists } from "./config";
import { TOOLCHAIN_TEMPLATES_DIR } from "./constants";
import type { ResolvedConfig } from "./types";

const PROJECT_REPLACEMENTS = [
  ["{{projectName}}", (config: ResolvedConfig) => config.projectName],
  ["{{packageName}}", (config: ResolvedConfig) => config.packageName],
] as const;

interface PackageJsonShape {
  name?: string;
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function generateProject(config: ResolvedConfig) {
  const spin = spinner();
  const templateDirectory = await ensureTemplateDirectoryExists(
    config.template,
  );

  spin.start(`Scaffolding ${config.template}...`);

  try {
    spin.message("Validating target directory");
    await prepareTargetDirectory(config.targetPathAbsolute);

    spin.message("Copying template files");
    await mkdir(config.targetPathAbsolute, { recursive: true });
    await cp(templateDirectory, config.targetPathAbsolute, { recursive: true });

    if (config.toolchain !== "none") {
      spin.message(`Applying ${config.toolchain} toolchain`);
      await applyToolchainFiles(config);
    }

    spin.message("Patching project files");
    await applyProjectReplacements(config.targetPathAbsolute, config);
    await patchPackageJson(config);

    spin.stop(`Created ${config.packageName}`);
  } catch (error) {
    spin.error("Scaffolding failed");
    throw error;
  }
}

async function prepareTargetDirectory(targetPathAbsolute: string) {
  try {
    const entries = await readdir(targetPathAbsolute);

    if (entries.length > 0) {
      throw new Error(
        `Target directory already exists and is not empty: ${targetPathAbsolute}`,
      );
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      return;
    }

    throw error;
  }
}

async function applyToolchainFiles(config: ResolvedConfig) {
  const sourceDirectory = resolve(TOOLCHAIN_TEMPLATES_DIR, config.toolchain);
  await cp(sourceDirectory, config.targetPathAbsolute, {
    recursive: true,
  });
}

async function applyProjectReplacements(
  targetDirectory: string,
  config: ResolvedConfig,
) {
  const files = await listFiles(targetDirectory);

  for (const file of files) {
    const original = await readFile(file, "utf8");
    let next = original;

    for (const [token, getValue] of PROJECT_REPLACEMENTS) {
      next = next.split(token).join(getValue(config));
    }

    if (config.alias !== "~/*") {
      next = next.split("~/*").join(config.alias);
      next = next.split("~/").join(config.aliasImportPrefix);
    }

    if (next !== original) {
      await writeFile(file, next, "utf8");
    }
  }
}

async function patchPackageJson(config: ResolvedConfig) {
  const packageJsonPath = resolve(config.targetPathAbsolute, "package.json");
  const packageJson = JSON.parse(
    await readFile(packageJsonPath, "utf8"),
  ) as PackageJsonShape;

  packageJson.name = config.packageName;
  packageJson.scripts = {
    ...packageJson.scripts,
    ...getToolchainScripts(config.toolchain),
  };
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    ...getToolchainDevDependencies(config.toolchain),
  };

  await writeFile(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
}

function getToolchainScripts(
  toolchain: ResolvedConfig["toolchain"],
): Record<string, string> {
  switch (toolchain) {
    case "none":
      return {};
    case "biome":
      return {
        lint: "bunx @biomejs/biome lint .",
        "lint:fix": "bunx @biomejs/biome lint --write .",
        format: "bunx @biomejs/biome format --write .",
        "format:check": "bunx @biomejs/biome format .",
        check: "bunx @biomejs/biome check .",
        "check:write": "bunx @biomejs/biome check --write .",
      };
    case "eslint-prettier":
      return {
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        format: "prettier . --write",
        "format:check": "prettier . --check",
        check: "bun run lint && bun run format:check",
        "check:write": "bun run lint:fix && bun run format",
      };
  }
}

function getToolchainDevDependencies(
  toolchain: ResolvedConfig["toolchain"],
): Record<string, string> {
  switch (toolchain) {
    case "none":
      return {};
    case "biome":
      return {
        "@biomejs/biome": "2.4.10",
      };
    case "eslint-prettier":
      return {
        "@eslint/js": "^9.38.0",
        eslint: "^9.38.0",
        "eslint-config-prettier": "^10.1.8",
        globals: "^16.4.0",
        prettier: "^3.6.2",
        "typescript-eslint": "^8.46.1",
      };
  }
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(absolutePath)));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
