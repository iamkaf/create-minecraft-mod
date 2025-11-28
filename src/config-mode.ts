import { log } from "@clack/prompts";
import { validateDestinationPath } from './util.js';
import { loadConfigFile, configToMod, mergeConfigWithArgs, type CliArgs } from './config-loader.js';
import { runPipeline } from './pipeline-runner.js';
import { createReporter } from './result-reporter.js';

/**
 * Handle config mode execution using configuration files
 */
export async function handleConfigMode(args: CliArgs): Promise<void> {
  try {
    // Validate config file path
    if (!args.config) {
      throw new Error('--config path is required in config mode');
    }

    // Load and validate configuration file
    const config = await loadConfigFile(args.config);

    // Merge CLI arguments with configuration (CLI args take precedence)
    const finalConfig = mergeConfigWithArgs(config, args);

    // Determine destination path
    const destinationPath = args.destinationPath || finalConfig.mod.id || './mod';

    // Validate destination path
    const validation = validateDestinationPath(destinationPath);
    if (!validation.valid) {
      throw new Error(`Invalid destination path: ${validation.error}`);
    }

    // Create Mod object from configuration
    const mod = configToMod(finalConfig, destinationPath);

    // Set default version if not provided
    if (!mod.version) {
      mod.version = '1.0.0';
    }

    // Configure pipeline options from configuration
    const pipelineOptions = {
      skipGradle: finalConfig.pipeline.skipGradle || false,
      skipGit: finalConfig.pipeline.skipGit || false,
      skipIde: finalConfig.pipeline.skipIde || false,
      silent: true // Run silently in CI mode
    };

    // Create reporter for result output
    const reporter = createReporter(mod);

    // Log start of execution
    log.info(`Starting config mode mod creation...`);
    log.info(`Config file: ${args.config}`);
    log.info(`Mod: ${mod.name} (${mod.id})`);
    log.info(`Author: ${mod.author}`);
    log.info(`Loaders: ${mod.loaders.join(', ')}`);
    log.info(`Libraries: ${mod.libraries.join(', ') || 'None'}`);
    log.info(`Runtime Mods: ${mod.mods.join(', ') || 'None'}`);
    log.info(`License: ${mod.license}`);
    log.info(`Destination: ${mod.destinationPath}`);
    log.info(`Output Format: ${finalConfig.pipeline.outputFormat || 'text'}`);

    // Run the pipeline
    const pipelineResult = await runPipeline(mod, pipelineOptions);

    // Report results
    reporter.report(pipelineResult, {
      configPath: args.config,
      outputFormat: finalConfig.pipeline.outputFormat || 'text',
      summary: finalConfig.pipeline.outputFormat !== 'json'
    });

    // Exit with appropriate code
    process.exit(pipelineResult.success ? 0 : 1);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error(`Config mode failed: ${errorMessage}`);

    // For non-JSON output, also log to stderr for better CI integration
    if (!args.config || !args.config.includes('json')) {
      console.error(`Error: ${errorMessage}`);
    }

    process.exit(1);
  }
}

/**
 * Get config mode help text
 */
export function getConfigModeHelp(): string {
  return `
Config Mode Usage:
  create-minecraft-mod [destination-path] --config <config-file> [options]

Required Options:
  --config <path>              Path to JSON configuration file

Optional Options:
  --name <string>              Override mod name from config
  --author <string>            Override mod author from config
  --id <string>                Override mod ID from config
  --description <string>       Override mod description from config
  --package <string>           Override Java package from config
  --minecraft <string>         Override Minecraft version from config
  --java-version <string>       Override Java version from config
  --loaders <list>             Override loaders from config
  --libraries <list>           Override libraries from config
  --utility <list>             Override utility mods from config
  --license <type>             Override license type from config
  --skip-gradle               Skip Gradle execution (override config)
  --skip-git                  Skip git initialization (override config)
  --skip-ide                  Skip IDE opening (override config)
  --output-format <format>     Output format (json,text) (override config)

Configuration File Format:
{
  "mod": {
    "name": "My Cool Mod",
    "author": "MyName",
    "id": "my-cool-mod",
    "description": "A test mod",
    "package": "com.example.mycoolmod",
    "minecraftVersion": "1.21.10",
    "javaVersion": "21"
  },
  "options": {
    "loaders": ["fabric", "forge", "neoforge"],
    "libraries": ["amber", "cloth-config", "architectury"],
    "utility": ["modmenu", "jei", "jade", "sodium"],
    "license": "mit"
  },
  "pipeline": {
    "skipGradle": false,
    "skipGit": false,
    "skipIde": false,
    "outputFormat": "json"
  }
}

Examples:
  create-minecraft-mod ./my-mod --config ./config.json
  create-minecraft-mod ./my-mod --config ./config.json --output-format json
  create-minecraft-mod ./my-mod --config ./config.json --name "Override Name"
`;
}