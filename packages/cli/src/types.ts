export type Toolchain = "none" | "biome" | "eslint-prettier";

export interface ResolvedConfig {
  alias: string;
  aliasImportPrefix: string;
  initGit: boolean;
  installDependencies: boolean;
  library: string;
  packageName: string;
  projectName: string;
  runtime: string;
  targetPath: string;
  targetPathAbsolute: string;
  template: string;
  toolchain: Toolchain;
}
