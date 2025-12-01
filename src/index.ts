import { cancel } from "@clack/prompts";
import { parseArguments, type CliArgs, CLIMode } from "./cli.js";
import { handleHeadlessMode } from "./headless-mode.js";
import { handleConfigMode } from "./config-mode.js";

const args = parseArguments(process.argv);

if (args.help) {
	console.log(`
Usage: create-minecraft-mod [destination-path] [options]

Arguments:
  destination-path    Path where the mod project should be created
                     (optional, will prompt if not provided)

Options:
  --help, -h         Show this help message
  --ci-mode          Enable non-interactive mode
  --config <path>    Use JSON configuration file
  --name <string>    Mod name
  --author <string>  Mod author
  --id <string>      Mod ID
  --minecraft <ver>  Minecraft version
  --loaders <list>   Comma-separated loaders (fabric,forge,neoforge)
  --libraries <list> Comma-separated libraries
  --mods <list>       Comma-separated runtime mods
  --license <type>   License type
  --skip-gradle      Skip Gradle execution
  --skip-git         Skip git initialization
  --skip-ide         Skip IDE opening
  --output-format    Output format (json,text)
  --fabric-loom-version <version> Fabric Loom version (1.10,1.11,1.12,1.13)

Examples:
  create-minecraft-mod ./my-mod                    # Interactive mode
  create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me"  # CI mode
  create-minecraft-mod ./my-mod --config ./config.json  # Config mode
  `);
	process.exit(0);
}

// Determine operation mode
function determineMode(args: CliArgs): CLIMode {
  if (args.config) {
    return CLIMode.CONFIG;
  }
  if (args.ciMode) {
    return CLIMode.HEADLESS;
  }
  return CLIMode.INTERACTIVE;
}

const mode = determineMode(args);

// Route to appropriate mode handler
if (mode !== CLIMode.INTERACTIVE) {
  try {
    if (mode === CLIMode.HEADLESS) {
      await handleHeadlessMode(args);
    } else if (mode === CLIMode.CONFIG) {
      await handleConfigMode(args);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
  process.exit(0);
}

//
// ─── INTERACTIVE MODE ───────────────────────────────────────────────
//
try {
	const { runInteractiveMode } = await import('./interactive/index.js');
	await runInteractiveMode({ destinationPath: args.destinationPath });
} catch (error) {
	cancel(`❌ Failed to create mod: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
}
