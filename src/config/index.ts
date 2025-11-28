/**
 * Configuration barrel export
 * Centralized imports for all configuration modules
 */

// Utility mod configuration
export {
  type ModLoader,
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