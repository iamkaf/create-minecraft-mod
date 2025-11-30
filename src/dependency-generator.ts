import type { Mod } from './types.js';
import type { EchoRegistryAPIResponse } from './echo-registry.js';
import { getDependencyConfig, getRequiredRepositories } from './config/index.js';
import { extractCleanVersion } from './echo-registry.js';

/**
 * Dynamic dependency injection for Handlebars templates
 * Generates template variables based on selected dependencies
 */

export interface DependencyVariables {
  // Version variables for gradle.properties
  [key: string]: string | undefined;
}

export interface RepositoryConfiguration {
  repositories: string[];
  exclusiveContent?: string[];
}

export interface DependencyConfiguration {
  libraries: {
    common: string[];
    fabric: string[];
    forge: string[];
    neoforge: string[];
  };
  mods: {
    fabric: string[];
    forge: string[];
    neoforge: string[];
  };
}

/**
 * Generate dependency version variables for gradle.properties
 */
export function generateDependencyVariables(
  mod: Mod,
  registryData: EchoRegistryAPIResponse
): DependencyVariables {
  const variables: DependencyVariables = {};
  const dependencies = registryData.data.dependencies || [];

  // Process libraries
  for (const libraryId of mod.libraries) {
    const config = getDependencyConfig(libraryId);
    if (!config || config.type !== 'library') continue;

    const dependency = dependencies.find(d => d.name === config.registryProjectName);
    if (!dependency) continue;

    // Extract clean version from Maven coordinates or fallback to version field
    const cleanVersion = dependency.coordinates
      ? extractCleanVersion(dependency.coordinates)
      : dependency.version;

    if (cleanVersion) {
      variables[config.versions.templateVariable] = cleanVersion;
    }
  }

  // Process runtime mods
  for (const modId of mod.mods) {
    const config = getDependencyConfig(modId);
    if (!config || config.type !== 'mod') continue;

    const dependency = dependencies.find(d => d.name === config.registryProjectName);
    if (!dependency) continue;

    // Extract clean version from Maven coordinates or fallback to version field
    const cleanVersion = dependency.coordinates
      ? extractCleanVersion(dependency.coordinates)
      : dependency.version;

    if (cleanVersion) {
      variables[config.versions.templateVariable] = cleanVersion;
    }
  }

  return variables;
}

/**
 * Generate repository configuration for settings.gradle
 */
export function generateRepositoryConfiguration(mod: Mod): RepositoryConfiguration {
  const allDependencies = [...mod.libraries, ...mod.mods];
  const repositories = getRequiredRepositories(allDependencies);

  const repoConfig: RepositoryConfiguration = {
    repositories: [],
    exclusiveContent: []
  };

  // Add development repositories (no filter needed)
  for (const repo of repositories) {
    if (repo.id !== 'modrinth') {
      repoConfig.repositories.push(`
        maven {
            name = "${repo.name}"
            url = "${repo.url}"
        }`);
    }
  }

  // Add Modrinth Maven with exclusiveContent filter
  const modrinthRepo = repositories.find(r => r.id === 'modrinth');
  if (modrinthRepo && allDependencies.some(id => {
    const config = getDependencyConfig(id);
    return config?.type === 'mod';
  })) {
    repoConfig.exclusiveContent?.push(`
        // Modrinth Maven for runtime mods
        exclusiveContent {
            forRepository {
                maven {
                    name = "Modrinth"
                    url = "${modrinthRepo.url}"
                }
            }
            filter {
                includeGroup "maven.modrinth"
            }
        }`);
  }

  return repoConfig;
}

/**
 * Generate dependency declarations for build.gradle files
 */
export function generateDependencyConfiguration(mod: Mod): DependencyConfiguration {
  const config: DependencyConfiguration = {
    libraries: {
      common: [],
      fabric: [],
      forge: [],
      neoforge: []
    },
    mods: {
      fabric: [],
      forge: [],
      neoforge: []
    }
  };

  // Process libraries
  for (const libraryId of mod.libraries) {
    const depConfig = getDependencyConfig(libraryId);
    if (!depConfig || depConfig.type !== 'library') continue;

    // Common library dependencies
    if (depConfig.coordinates.common && mod.loaders.length > 0) {
      config.libraries.common.push(
        `api group: '${depConfig.coordinates.common.split(':')[0]}', name: '${depConfig.coordinates.common.split(':')[1]}', version: ${depConfig.versions.templateVariable}`
      );
    }

    // Loader-specific library dependencies
    for (const loader of mod.loaders) {
      const coords = depConfig.coordinates[loader as keyof typeof depConfig.coordinates];
      if (coords) {
        const parts = coords.split(':');
        if (parts.length >= 2) {
          const [group, artifact] = parts;
          const dependencyType = loader === 'forge' ? 'implementation' :
                                (artifact!.includes('config') || artifact!.includes('api')) ? 'modApi' : 'modImplementation';

          config.libraries[loader as keyof typeof config.libraries].push(
            `${dependencyType} group: '${group}', name: '${artifact}', version: ${depConfig.versions.templateVariable}`
          );
        }
      }
    }
  }

  // Process runtime mods
  for (const modId of mod.mods) {
    const depConfig = getDependencyConfig(modId);
    if (!depConfig || depConfig.type !== 'mod') continue;

    for (const loader of mod.loaders) {
      const coords = depConfig.coordinates[loader as keyof typeof depConfig.coordinates];
      if (coords) {
        const cleanVersion = depConfig.versions.templateVariable;
        // Add loader suffix for runtime mods
        const versionWithSuffix = `${cleanVersion}-${loader}`;

        config.mods[loader as keyof typeof config.mods].push(
          `modImplementation "${coords}:${versionWithSuffix}"`
        );
      }
    }
  }

  return config;
}

/**
 * Generate Handlebars-friendly template data structure
 */
export function generateHandlebarsData(mod: Mod, registryData: EchoRegistryAPIResponse) {
  const dependencyVariables = generateDependencyVariables(mod, registryData);
  const repositoryConfig = generateRepositoryConfiguration(mod);
  const dependencyConfig = generateDependencyConfiguration(mod);

  return {
    // Version variables for gradle.properties
    versions: dependencyVariables,

    // Repository blocks for settings.gradle
    repositories: {
      development: repositoryConfig.repositories.join('\n'),
      modrinth: repositoryConfig.exclusiveContent?.join('\n') || ''
    },

    // Dependency blocks for build.gradle files
    dependencies: {
      libraries: dependencyConfig.libraries,
      mods: dependencyConfig.mods
    },

    // Boolean flags for conditional template rendering
    hasLibraries: mod.libraries.length > 0,
    hasMods: mod.mods.length > 0,
    hasModrinthMods: mod.mods.some(id => {
      const config = getDependencyConfig(id);
      return config?.type === 'mod';
    })
  };
}