import { spawn } from "node:child_process";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spinner } from "@clack/prompts";
import { ensureTemplateDirectoryExists } from "./config";
import { TOOLCHAIN_TEMPLATES_DIR } from "./constants";
import type { ResolvedConfig } from "./types";

const EXCLUDED_TEMPLATE_ENTRIES = new Set([
  ".cache",
  ".DS_Store",
  ".git",
  ".idea",
  ".turbo",
  ".vscode",
  "bun.lock",
  "bun.lockb",
  "dist",
  "node_modules",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);

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
    await cp(templateDirectory, config.targetPathAbsolute, {
      recursive: true,
      filter(source) {
        const entryName = source.split(/[/\\]/).pop();
        return !entryName || !EXCLUDED_TEMPLATE_ENTRIES.has(entryName);
      },
    });

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

export async function finalizeProject(config: ResolvedConfig) {
  const spin = spinner();
  const packageManager = config.runtime === "node" ? "npm" : "bun";

  try {
    if (config.installDependencies) {
      spin.start("Installing dependencies");
      await runCommand(packageManager, ["install"], config.targetPathAbsolute);
      spin.stop("Installed dependencies");
    }

    if (config.initGit) {
      spin.start("Initializing git repository");
      await runCommand("git", ["init"], config.targetPathAbsolute);
      spin.stop("Initialized git repository");
    }
  } catch (error) {
    spin.error("Project setup failed");
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
    filter(source) {
      const entryName = source.split(/[/\\]/).pop();
      return !entryName || !EXCLUDED_TEMPLATE_ENTRIES.has(entryName);
    },
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
    ...getToolchainScripts(config),
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

function getToolchainScripts(config: ResolvedConfig): Record<string, string> {
  const packageRunner = config.runtime === "node" ? "npm run" : "bun run";
  const packageExecutor = config.runtime === "node" ? "npx" : "bunx";

  switch (config.toolchain) {
    case "none":
      return {};
    case "biome":
      return {
        lint: `${packageExecutor} @biomejs/biome lint .`,
        "lint:fix": `${packageExecutor} @biomejs/biome lint --write .`,
        format: `${packageExecutor} @biomejs/biome format --write .`,
        "format:check": `${packageExecutor} @biomejs/biome format .`,
        check: `${packageExecutor} @biomejs/biome check .`,
        "check:write": `${packageExecutor} @biomejs/biome check --write .`,
      };
    case "eslint-prettier":
      return {
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        format: "prettier . --write",
        "format:check": "prettier . --check",
        check: `${packageRunner} lint && ${packageRunner} format:check`,
        "check:write": `${packageRunner} lint:fix && ${packageRunner} format`,
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

function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      rejectPromise(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code ?? "unknown"}.${[stdout.trim(), stderr.trim()].filter(Boolean).length ? `\n${[stdout.trim(), stderr.trim()].filter(Boolean).join("\n")}` : ""}`,
        ),
      );
    });
  });
}
