import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts";

async function main() {
  intro("🪄 Magicwand");

  const projectName = await text({
    message: "Project name?",
    placeholder: "my-api",
    defaultValue: "my-api",
  });

  if (isCancel(projectName)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }

  const runtime = await select({
    message: "Runtime",
    options: [
      { value: "node", label: "Node" },
      { value: "bun", label: "Bun" },
    ],
  });

  if (isCancel(runtime)) {
    cancel("Setup cancelled.");
    process.exit(0);
  }

  const _config = {
    projectName,
    runtime,
  };

  // console.log(_config);
  outro("Config captured.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
