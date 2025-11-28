/**
 * Configuration barrel export
 * Centralized imports for all configuration modules
 */

// New dependency configuration (recommended for all new code)
export {
  type ModLoader,
  type DependencyType,
  type DependencyCategory,
  type MavenRepository,
  type MavenCoordinates,
  type CommonMavenCoordinates,
  type DependencyConfig,
  MAVEN_REPOSITORIES,
  DEPENDENCIES,
  getDependencyConfig,
  getDependenciesForLoader,
  getDependenciesByType,
  getDependenciesByCategory,
  getDependencyGroups,
  getDependencyProjectNames,
  isValidDependencyId,
  validateDependencyIds,
  getLibraryDependencies,
  getModDependencies,
  getRequiredRepositories
} from './dependencies.js';

// Legacy utility mod configuration (for backward compatibility)
export {
  type UtilityModCategory,
  type UtilityModConfig,
  UTILITY_MODS,
  getUtilityModConfig,
  getUtilityModsForLoader,
  getUtilityModsByCategory,
  getUtilityModGroups,
  getUtilityModProjectNames,
  isValidUtilityModId,
  validateUtilityModIds
} from './utility-mods.js';

// API URL configuration
export {
  API_ENDPOINTS,
  URL_BUILDERS,
  getEchoRegistryUrl
} from './api-urls.js';