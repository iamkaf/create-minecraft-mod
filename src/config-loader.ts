import { promises as fs } from 'fs';
import { resolve } from 'path';
import type { Mod } from './types.js';
import { isValidUtilityModId, validateUtilityModIds } from './config/index.js';

/**
 * Configuration file interface for headless/CI mode
 */
export interface ModConfigFile {
  mod: {
    name: string;
    author: string;
    id: string;
    version?: string;
    description?: string;
    package?: string;
    minecraftVersion?: string;
    javaVersion?: string;
  };
  options: {
    loaders: string[];
    libraries?: string[];
    utility?: string[];
    license?: string;
  };
  pipeline: {
    skipGradle?: boolean;
    skipGit?: boolean;
    skipIde?: boolean;
    outputFormat?: 'json' | 'text';
  };
}

/**
 * Strictly typed pipeline configuration
 */
export interface PipelineConfig {
  skipGradle: boolean;
  skipGit: boolean;
  skipIde: boolean;
  outputFormat: 'json' | 'text';
}

/**
 * Valid post-creation actions
 */
export type PostCreationAction = 'git-init' | 'run-gradle' | 'open-vscode' | 'open-intellij';

/**
 * Load and validate a JSON configuration file
 */
export async function loadConfigFile(configPath: string): Promise<ModConfigFile> {
  try {
    const resolvedPath = resolve(configPath);
    const configFileContent = await fs.readFile(resolvedPath, 'utf-8');
    const config = JSON.parse(configFileContent) as ModConfigFile;

    // Validate required fields
    validateConfigFile(config);

    return config;
  } catch (error) {
    throw new Error(`Failed to load configuration file "${configPath}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate configuration file structure and values
 */
function validateConfigFile(config: ModConfigFile): void {
  const errors: string[] = [];

  // Validate mod section
  if (!config.mod) {
    errors.push('Missing "mod" section');
  } else {
    if (!config.mod.name || typeof config.mod.name !== 'string' || config.mod.name.trim().length === 0) {
      errors.push('mod.name is required and must be a non-empty string');
    }
    if (!config.mod.author || typeof config.mod.author !== 'string' || config.mod.author.trim().length === 0) {
      errors.push('mod.author is required and must be a non-empty string');
    }
    if (!config.mod.id || typeof config.mod.id !== 'string' || config.mod.id.trim().length === 0) {
      errors.push('mod.id is required and must be a non-empty string');
    }
    // Validate mod ID format (alphanumeric, hyphens, underscores only)
    if (config.mod.id && !/^[a-z][a-z0-9_-]*$/i.test(config.mod.id)) {
      errors.push('mod.id must start with a letter and contain only letters, numbers, hyphens, and underscores');
    }
    if (config.mod.minecraftVersion && typeof config.mod.minecraftVersion !== 'string') {
      errors.push('mod.minecraftVersion must be a string if provided');
    }
    if (config.mod.javaVersion && !/^\d+$/.test(config.mod.javaVersion)) {
      errors.push('mod.javaVersion must be a valid Java version number (e.g., "21", "17")');
    }
    if (config.mod.description && typeof config.mod.description !== 'string') {
      errors.push('mod.description must be a string if provided');
    }
    if (config.mod.package && typeof config.mod.package !== 'string') {
      errors.push('mod.package must be a string if provided');
    }
  }

  // Validate options section
  if (!config.options) {
    errors.push('Missing "options" section');
  } else {
    if (!Array.isArray(config.options.loaders) || config.options.loaders.length === 0) {
      errors.push('options.loaders is required and must be a non-empty array');
    } else {
      const validLoaders = ['fabric', 'forge', 'neoforge'];
      const invalidLoaders = config.options.loaders.filter(loader => !validLoaders.includes(loader));
      if (invalidLoaders.length > 0) {
        errors.push(`Invalid loaders: ${invalidLoaders.join(', ')}. Valid loaders: ${validLoaders.join(', ')}`);
      }
      // Check for duplicates
      const uniqueLoaders = new Set(config.options.loaders);
      if (uniqueLoaders.size !== config.options.loaders.length) {
        errors.push('Duplicate loaders found in options.loaders');
      }
    }

    if (config.options.libraries && !Array.isArray(config.options.libraries)) {
      errors.push('options.libraries must be an array if provided');
    } else if (config.options.libraries) {
      // Check for duplicates
      const uniqueLibraries = new Set(config.options.libraries);
      if (uniqueLibraries.size !== config.options.libraries.length) {
        errors.push('Duplicate libraries found in options.libraries');
      }
    }

    if (config.options.utility && !Array.isArray(config.options.utility)) {
      errors.push('options.utility must be an array if provided');
    } else if (config.options.utility) {
      const validation = validateUtilityModIds(config.options.utility);
      if (validation.invalid.length > 0) {
        errors.push(`Invalid utility mods: ${validation.invalid.join(', ')}`);
      }
      // Check for duplicates
      const uniqueUtility = new Set(config.options.utility);
      if (uniqueUtility.size !== config.options.utility.length) {
        errors.push('Duplicate utility mods found in options.utility');
      }
    }

    if (config.options.license && typeof config.options.license !== 'string') {
      errors.push('options.license must be a string if provided');
    }
  }

  // Validate pipeline section with strict typing
  if (config.pipeline) {
    if (config.pipeline.skipGradle !== undefined && typeof config.pipeline.skipGradle !== 'boolean') {
      errors.push('pipeline.skipGradle must be a boolean if provided');
    }
    if (config.pipeline.skipGit !== undefined && typeof config.pipeline.skipGit !== 'boolean') {
      errors.push('pipeline.skipGit must be a boolean if provided');
    }
    if (config.pipeline.skipIde !== undefined && typeof config.pipeline.skipIde !== 'boolean') {
      errors.push('pipeline.skipIde must be a boolean if provided');
    }
    if (config.pipeline.outputFormat && !['json', 'text'].includes(config.pipeline.outputFormat)) {
      errors.push('pipeline.outputFormat must be either "json" or "text"');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(error => `- ${error}`).join('\n')}`);
  }
}

/**
 * Convert configuration file to Mod object for pipeline
 */
export function configToMod(config: ModConfigFile, destinationPath: string): Mod {
  // Convert pipeline settings to postActions
  const postActions: PostCreationAction[] = [];

  if (config.pipeline) {
    if (!config.pipeline.skipGit) {
      postActions.push('git-init');
    }
    if (!config.pipeline.skipGradle) {
      postActions.push('run-gradle');
    }
    if (!config.pipeline.skipIde) {
      // Default to VSCode for IDE integration
      postActions.push('open-vscode');
    }
  }

  return {
    name: config.mod.name,
    author: config.mod.author,
    id: config.mod.id,
    description: config.mod.description || '',
    version: config.mod.version || '1.0.0',
    package: config.mod.package || `${config.mod.author.toLowerCase().replace(/\s+/g, '.')}.${config.mod.id}`,
    javaVersion: config.mod.javaVersion || '21',
    minecraftVersion: config.mod.minecraftVersion || '1.21.10',
    loaders: config.options.loaders,
    libraries: config.options.libraries || [],
    mods: config.options.mods || config.options.utility || [],
    samples: [],
    postActions,
    license: config.options.license || 'mit',
    destinationPath
  };
}

/**
 * Interface for CLI arguments
 */
export interface CliArgs {
  name?: string;
  author?: string;
  id?: string;
  description?: string;
  package?: string;
  minecraft?: string;
  javaVersion?: string;
  loaders?: string;
  libraries?: string;
  utility?: string;
  license?: string;
  skipGradle?: boolean;
  skipGit?: boolean;
  skipIde?: boolean;
  outputFormat?: 'json' | 'text';
  config?: string;
  destinationPath?: string;
  help?: boolean;
}

/**
 * Merge CLI arguments with configuration file (CLI args take precedence)
 */
export function mergeConfigWithArgs(config: ModConfigFile, args: CliArgs): ModConfigFile {
  const merged: ModConfigFile = JSON.parse(JSON.stringify(config)); // Deep clone

  // Override mod settings with type checking
  if (args.name && typeof args.name === 'string') {
    merged.mod.name = args.name.trim();
  }
  if (args.author && typeof args.author === 'string') {
    merged.mod.author = args.author.trim();
  }
  if (args.id && typeof args.id === 'string') {
    merged.mod.id = args.id.trim();
  }
  if (args.description && typeof args.description === 'string') {
    merged.mod.description = args.description.trim();
  }
  if (args.package && typeof args.package === 'string') {
    merged.mod.package = args.package.trim();
  }
  if (args.minecraft && typeof args.minecraft === 'string') {
    merged.mod.minecraftVersion = args.minecraft.trim();
  }
  if (args.javaVersion && typeof args.javaVersion === 'string') {
    merged.mod.javaVersion = args.javaVersion.trim();
  }

  // Override options with validation
  if (args.loaders && typeof args.loaders === 'string') {
    const parsedLoaders = args.loaders.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (parsedLoaders.length > 0) {
      merged.options.loaders = parsedLoaders;
    }
  }
  if (args.libraries && typeof args.libraries === 'string') {
    const parsedLibraries = args.libraries.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (parsedLibraries.length > 0) {
      merged.options.libraries = parsedLibraries;
    }
  }
  if (args.utility && typeof args.utility === 'string') {
    const parsedUtility = args.utility.split(',').map((s: string) => s.trim()).filter(Boolean);
    if (parsedUtility.length > 0) {
      merged.options.utility = parsedUtility;
    }
  }
  if (args.license && typeof args.license === 'string') {
    merged.options.license = args.license.trim();
  }

  // Override pipeline settings with type checking
  if (!merged.pipeline) {
    merged.pipeline = {};
  }

  if (args.skipGradle !== undefined) {
    merged.pipeline.skipGradle = Boolean(args.skipGradle);
  }
  if (args.skipGit !== undefined) {
    merged.pipeline.skipGit = Boolean(args.skipGit);
  }
  if (args.skipIde !== undefined) {
    merged.pipeline.skipIde = Boolean(args.skipIde);
  }
  if (args.outputFormat && ['json', 'text'].includes(args.outputFormat)) {
    merged.pipeline.outputFormat = args.outputFormat;
  }

  return merged;
}