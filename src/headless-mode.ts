import { log } from "@clack/prompts";
import type { CliArgs } from './cli.js';
import { validateDestinationPath, formatModId, formatPackageName } from './util.js';
import { runPipeline, createModFromArgs } from './pipeline-runner.js';
import { createReporter } from './result-reporter.js';

/**
 * Handle headless mode execution using CLI arguments
 */
export async function handleHeadlessMode(args: CliArgs): Promise<void> {
  try {
    // Validate destination path
    const destinationPath = args.destinationPath || './mod';
    const validation = validateDestinationPath(destinationPath);
    if (!validation.valid) {
      throw new Error(`Invalid destination path: ${validation.error}`);
    }

    // Validate required arguments
    if (!args.name) {
      throw new Error('--name is required in CI mode');
    }
    if (!args.author) {
      throw new Error('--author is required in CI mode');
    }

    // Create Mod object from arguments
    const mod = createModFromArgs(args, destinationPath);

    // Ensure package is properly formatted
    mod.package = formatPackageName(mod.package);
    mod.id = formatModId(mod.id);

    // Set default version if not provided
    if (!mod.version) {
      mod.version = '1.0.0';
    }

    // Configure pipeline options from CLI arguments
    const pipelineOptions = {
      skipGradle: args.skipGradle || false,
      skipGit: args.skipGit || false,
      skipIde: args.skipIde || false,
      silent: true // Run silently in CI mode
    };

    // Create reporter for result output
    const reporter = createReporter(mod);

    // Log start of execution
    log.info(`Starting headless mode mod creation...`);
    log.info(`Mod: ${mod.name} (${mod.id})`);
    log.info(`Author: ${mod.author}`);
    log.info(`Loaders: ${mod.loaders.join(', ')}`);
    log.info(`Libraries: ${mod.libraries.join(', ') || 'None'}`);
    log.info(`Utility Mods: ${mod.utility.join(', ') || 'None'}`);
    log.info(`Destination: ${mod.destinationPath}`);

    // Run the pipeline
    const pipelineResult = await runPipeline(mod, pipelineOptions);

    // Report results
    reporter.report(pipelineResult, {
      outputFormat: args.outputFormat || 'text',
      summary: args.outputFormat !== 'json'
    });

    // Exit with appropriate code
    process.exit(pipelineResult.success ? 0 : 1);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error(`Headless mode failed: ${errorMessage}`);

    // For non-JSON output, also log to stderr for better CI integration
    if (args.outputFormat !== 'json') {
      console.error(`Error: ${errorMessage}`);
    }

    process.exit(1);
  }
}

/**
 * Validate headless mode arguments
 */
export function validateHeadlessArgs(args: CliArgs): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required arguments
  if (!args.name) {
    errors.push('--name is required in CI mode');
  }
  if (!args.author) {
    errors.push('--author is required in CI mode');
  }

  // Validate loaders if provided
  if (args.loaders) {
    const loaders = args.loaders.split(',').map(s => s.trim());
    const validLoaders = ['fabric', 'forge', 'neoforge'];
    const invalidLoaders = loaders.filter(loader => !validLoaders.includes(loader));

    if (invalidLoaders.length > 0) {
      errors.push(`Invalid loaders: ${invalidLoaders.join(', ')}. Valid loaders: ${validLoaders.join(', ')}`);
    }
  }

  // Validate output format if provided
  if (args.outputFormat && !['json', 'text'].includes(args.outputFormat)) {
    errors.push('Invalid output format. Valid formats: json, text');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get headless mode help text
 */
export function getHeadlessModeHelp(): string {
  return `
Headless Mode Usage:
  create-minecraft-mod [destination-path] --ci-mode [options]

Required Options:
  --name <string>              Mod name
  --author <string>            Mod author

Optional Options:
  --id <string>                Mod ID (auto-generated from name if not provided)
  --description <string>       Mod description
  --package <string>           Java package (e.g., com.example.mymod)
  --minecraft <string>         Minecraft version (default: 1.21.10)
  --java-version <string>       Java version (default: 21)
  --loaders <list>             Comma-separated loaders (fabric,forge,neoforge)
  --libraries <list>           Comma-separated libraries
  --utility <list>             Comma-separated utility mods
  --license <type>             License type (mit,lgpl,arr)
  --skip-gradle               Skip Gradle execution
  --skip-git                  Skip git initialization
  --skip-ide                  Skip IDE opening
  --output-format <format>     Output format (json,text)

Examples:
  create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me"
  create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me" --loaders "fabric,forge"
  create-minecraft-mod ./my-mod --ci-mode --name "My Mod" --author "Me" --output-format json
`;
}