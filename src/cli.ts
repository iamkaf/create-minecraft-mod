import { resolve } from "node:path";

export enum CLIMode {
  INTERACTIVE = "interactive",
  HEADLESS = "headless",
  CONFIG = "config"
}

export interface CliArgs {
  destinationPath?: string;
  help: boolean;
  ciMode?: boolean;
  config?: string;
  name?: string;
  author?: string;
  id?: string;
  description?: string;
  package?: string;
  minecraft?: string;
  javaVersion?: string;
  loaders?: string;
  libraries?: string;
  mods?: string;
  license?: string;
  gradleVersion?: string;
  skipGradle?: boolean;
  skipGit?: boolean;
  skipIde?: boolean;
  outputFormat?: 'json' | 'text';
}

function parseArguments(args: string[]): CliArgs {
  const nodeArgs = args.slice(2); // Remove node and script path

  const result: CliArgs = {
    help: nodeArgs.includes("--help") || nodeArgs.includes("-h"),
  };

  // Parse destination path (non-flag argument)
  const nonFlagArgs = nodeArgs.filter(arg => !arg.startsWith("-"));
  if (nonFlagArgs[0]) {
    result.destinationPath = nonFlagArgs[0];
  }

  // Parse named arguments
  for (let i = 0; i < nodeArgs.length; i++) {
    const arg = nodeArgs[i];
    const nextArg = nodeArgs[i + 1];

    switch (arg) {
      case "--ci-mode":
        result.ciMode = true;
        break;
      case "--config":
        if (nextArg && !nextArg.startsWith("-")) {
          result.config = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--name":
        if (nextArg && !nextArg.startsWith("-")) {
          result.name = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--author":
        if (nextArg && !nextArg.startsWith("-")) {
          result.author = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--id":
        if (nextArg && !nextArg.startsWith("-")) {
          result.id = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--description":
        if (nextArg && !nextArg.startsWith("-")) {
          result.description = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--package":
        if (nextArg && !nextArg.startsWith("-")) {
          result.package = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--minecraft":
        if (nextArg && !nextArg.startsWith("-")) {
          result.minecraft = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--java-version":
        if (nextArg && !nextArg.startsWith("-")) {
          result.javaVersion = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--loaders":
        if (nextArg && !nextArg.startsWith("-")) {
          result.loaders = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--libraries":
        if (nextArg && !nextArg.startsWith("-")) {
          result.libraries = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--mods":
        if (nextArg && !nextArg.startsWith("-")) {
          result.mods = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--license":
        if (nextArg && !nextArg.startsWith("-")) {
          result.license = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--gradle-version":
        if (nextArg && !nextArg.startsWith("-")) {
          result.gradleVersion = nextArg;
          i++; // Skip next argument
        }
        break;
      case "--skip-gradle":
        result.skipGradle = true;
        break;
      case "--skip-git":
        result.skipGit = true;
        break;
      case "--skip-ide":
        result.skipIde = true;
        break;
      case "--output-format":
        if (nextArg && !nextArg.startsWith("-")) {
          const format = nextArg.toLowerCase();
          if (format === "json" || format === "text") {
            result.outputFormat = format;
          }
          i++; // Skip next argument
        }
        break;
    }
  }

  return result;
}

export { parseArguments };