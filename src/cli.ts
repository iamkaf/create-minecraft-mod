import { resolve } from "node:path";

interface CliArgs {
  destinationPath?: string;
  help: boolean;
}

function parseArguments(args: string[]): CliArgs {
  const nodeArgs = args.slice(2); // Remove node and script path

  const result: CliArgs = {
    help: nodeArgs.includes("--help") || nodeArgs.includes("-h"),
  };

  if (nodeArgs[0] && !nodeArgs[0].startsWith("-")) {
    result.destinationPath = nodeArgs[0];
  }

  return result;
}

export { parseArguments, type CliArgs };