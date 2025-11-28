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
    if (!config.mod.name || typeof config.mod.name !== 'string') {
      errors.push('mod.name is required and must be a string');
    }
    if (!config.mod.author || typeof config.mod.author !== 'string') {
      errors.push('mod.author is required and must be a string');
    }
    if (!config.mod.id || typeof config.mod.id !== 'string') {
      errors.push('mod.id is required and must be a string');
    }
    if (config.mod.minecraftVersion && typeof config.mod.minecraftVersion !== 'string') {
      errors.push('mod.minecraftVersion must be a string if provided');
    }
    if (config.mod.javaVersion && typeof config.mod.javaVersion !== 'string') {
      errors.push('mod.javaVersion must be a string if provided');
    }
  }

  // Validate options section
  if (!config.options) {
    errors.push('Missing "options" section');
  } else {
    if (!Array.isArray(config.options.loaders)) {
      errors.push('options.loaders is required and must be an array');
    } else {
      const validLoaders = ['fabric', 'forge', 'neoforge'];
      const invalidLoaders = config.options.loaders.filter(loader => !validLoaders.includes(loader));
      if (invalidLoaders.length > 0) {
        errors.push(`Invalid loaders: ${invalidLoaders.join(', ')}. Valid loaders: ${validLoaders.join(', ')}`);
      }
    }

    if (config.options.libraries && !Array.isArray(config.options.libraries)) {
      errors.push('options.libraries must be an array if provided');
    }

    if (config.options.utility && !Array.isArray(config.options.utility)) {
      errors.push('options.utility must be an array if provided');
    } else if (config.options.utility) {
      const validation = validateUtilityModIds(config.options.utility);
      if (validation.invalid.length > 0) {
        errors.push(`Invalid utility mods: ${validation.invalid.join(', ')}`);
      }
    }

    if (config.options.license && typeof config.options.license !== 'string') {
      errors.push('options.license must be a string if provided');
    }
  }

  // Validate pipeline section
  if (config.pipeline) {
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
    utility: config.options.utility || [],
    samples: [],
    postActions: [],
    license: config.options.license || 'mit',
    destinationPath
  };
}

/**
 * Merge CLI arguments with configuration file (CLI args take precedence)
 */
export function mergeConfigWithArgs(config: ModConfigFile, args: any): ModConfigFile {
  const merged = JSON.parse(JSON.stringify(config)); // Deep clone

  // Override mod settings
  if (args.name) merged.mod.name = args.name;
  if (args.author) merged.mod.author = args.author;
  if (args.id) merged.mod.id = args.id;
  if (args.description) merged.mod.description = args.description;
  if (args.package) merged.mod.package = args.package;
  if (args.minecraft) merged.mod.minecraftVersion = args.minecraft;
  if (args.javaVersion) merged.mod.javaVersion = args.javaVersion;

  // Override options
  if (args.loaders) {
    merged.options.loaders = args.loaders.split(',').map((s: string) => s.trim());
  }
  if (args.libraries) {
    merged.options.libraries = args.libraries.split(',').map((s: string) => s.trim());
  }
  if (args.utility) {
    merged.options.utility = args.utility.split(',').map((s: string) => s.trim());
  }
  if (args.license) merged.options.license = args.license;

  // Override pipeline settings
  if (args.skipGradle !== undefined) merged.pipeline.skipGradle = args.skipGradle;
  if (args.skipGit !== undefined) merged.pipeline.skipGit = args.skipGit;
  if (args.skipIde !== undefined) merged.pipeline.skipIde = args.skipIde;
  if (args.outputFormat) merged.pipeline.outputFormat = args.outputFormat;

  return merged;
}