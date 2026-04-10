import { intro, log, note, outro } from "@clack/prompts";
import { getHelpText, parseArgs } from "./args";
import { getAvailableTemplateIds, resolveConfig } from "./config";
import { ENABLED_TEMPLATES } from "./constants";
import { generateProject } from "./generate";

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    const availableTemplates = await getAvailableTemplateIds();
    console.log(
      getHelpText({
        availableTemplates,
        enabledTemplates: [...ENABLED_TEMPLATES],
      }),
    );
    return;
  }

  intro("🪄 create-magicwand");

  const config = await resolveConfig(args);

  note(
    [
      `target: ${config.targetPath}`,
      `template: ${config.template}`,
      `toolchain: ${config.toolchain}`,
      `alias: ${config.alias}`,
    ].join("\n"),
    "Config",
  );

  await generateProject(config);

  log.success(`Generated ${config.packageName} at ${config.targetPath}`);

  outro(
    [
      "Next steps:",
      `  cd ${config.targetPath}`,
      "  bun install",
      "  bun run dev",
    ].join("\n"),
  );
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : "Something went wrong.");
  process.exit(1);
});
