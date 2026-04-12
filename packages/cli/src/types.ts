export type Runtime = "bun" | "node";
export type Framework = "hono" | "express";
export type Toolchain = "none" | "biome" | "eslint-prettier";

export interface ResolvedConfig {
  alias: string;
  aliasImportPrefix: string;
  framework: Framework;
  initGit: boolean;
  installDependencies: boolean;
  packageName: string;
  projectName: string;
  runtime: Runtime;
  targetPath: string;
  targetPathAbsolute: string;
  template: string;
  toolchain: Toolchain;
}
