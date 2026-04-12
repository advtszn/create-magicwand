import { intro, log, note, outro } from "@clack/prompts";
import { getHelpText, parseArgs } from "./args";
import { getAvailableTemplateIds, resolveConfig } from "./config";
import { ENABLED_TEMPLATES } from "./constants";
import { finalizeProject, generateProject } from "./generate";

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
      `runtime: ${config.runtime}`,
      `framework: ${config.framework}`,
      `template: ${config.template}`,
      `toolchain: ${config.toolchain}`,
      `alias: ${config.alias}`,
      `install dependencies: ${config.installDependencies ? "yes" : "no"}`,
      `initialize git: ${config.initGit ? "yes" : "no"}`,
    ].join("\n"),
    "Config",
  );

  await generateProject(config);
  await finalizeProject(config);

  log.success(`Generated ${config.packageName} at ${config.targetPath}`);

  outro(buildNextSteps(config));
}

function buildNextSteps(config: Awaited<ReturnType<typeof resolveConfig>>) {
  const steps = ["Next steps:", `  cd ${config.targetPath}`];
  const packageManager = config.runtime === "node" ? "npm" : "bun";

  if (!config.installDependencies) {
    steps.push(`  ${packageManager} install`);
  }

  steps.push(`  ${packageManager} run dev:http`);

  return steps.join("\n");
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : "Something went wrong.");
  process.exit(1);
});
