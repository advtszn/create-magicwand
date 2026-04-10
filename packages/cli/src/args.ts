export interface CliArgs {
  targetPath?: string;
  template?: string;
  toolchain?: string;
  alias?: string;
  help: boolean;
}

const VALUE_FLAGS = new Map<
  string,
  keyof Pick<CliArgs, "template" | "toolchain" | "alias">
>([
  ["template", "template"],
  ["toolchain", "toolchain"],
  ["alias", "alias"],
]);

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    help: false,
  };

  let index = 0;

  while (index < argv.length) {
    const token = argv[index];

    if (!token) {
      index += 1;
      continue;
    }

    if (token === "--help" || token === "-h") {
      args.help = true;
      index += 1;
      continue;
    }

    if (token.startsWith("--")) {
      const [rawFlagName, inlineValue] = token.slice(2).split("=", 2);
      const flagName = rawFlagName ?? "";
      const mappedFlag = VALUE_FLAGS.get(flagName);

      if (!mappedFlag) {
        throw new Error(`Unknown option "--${flagName}".`);
      }

      const nextValue = argv[index + 1];
      const value = inlineValue ?? nextValue;

      if (!value || value.startsWith("--")) {
        throw new Error(`Option "--${flagName}" requires a value.`);
      }

      args[mappedFlag] = value;
      index += inlineValue === undefined ? 2 : 1;
      continue;
    }

    if (args.targetPath) {
      throw new Error(
        `Unexpected extra positional argument "${token}". Only <target-path> is supported.`,
      );
    }

    args.targetPath = token;
    index += 1;
  }

  return args;
}

export function getHelpText(options: {
  availableTemplates: string[];
  enabledTemplates: string[];
}) {
  const availableTemplates = options.availableTemplates.length
    ? options.availableTemplates.join(", ")
    : "(none found)";
  const enabledTemplates = options.enabledTemplates.join(", ");

  return [
    "Usage",
    "  create-magicwand <target-path> [options]",
    "",
    "Arguments",
    "  <target-path>              Destination path for the generated project",
    "",
    "Options",
    "  --template <name>         Template directory name under templates/base",
    "  --toolchain <name>        none | biome | eslint-prettier",
    '  --alias <pattern>         Import alias pattern, e.g. "~/*" or "@/*"',
    "  -h, --help                Show this help message",
    "",
    "Examples",
    "  create-magicwand my-api --template bun-hono",
    '  create-magicwand ./apps/my-api --template bun-hono --toolchain eslint-prettier --alias "@/*"',
    "  create-magicwand . --template bun-hono",
    "",
    `Available template directories: ${availableTemplates}`,
    `Enabled in v1: ${enabledTemplates}`,
    "",
    "Defaults",
    "  template: bun-hono",
    "  toolchain: biome",
    '  alias: "~/*"',
  ].join("\n");
}
