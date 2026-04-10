export type Toolchain = "none" | "biome" | "eslint-prettier";

export interface ResolvedConfig {
  alias: string;
  aliasImportPrefix: string;
  library: string;
  packageName: string;
  projectName: string;
  runtime: string;
  targetPath: string;
  targetPathAbsolute: string;
  template: string;
  toolchain: Toolchain;
}
