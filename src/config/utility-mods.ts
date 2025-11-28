import type { EchoRegistryAPIResponse } from '../echo-registry.js';
import {
  DEPENDENCIES,
  getDependenciesByType,
  type ModLoader,
  type DependencyCategory,
  type DependencyConfig
} from './dependencies.js';

export type UtilityModCategory = 'utility' | 'performance' | 'recipe-viewer' | 'integration';

// Backward compatibility: map DependencyCategory to UtilityModCategory
const categoryMapping: Record<DependencyCategory, UtilityModCategory> = {
  'utility': 'utility',
  'performance': 'performance',
  'recipe-viewer': 'recipe-viewer',
  'integration': 'integration',
  'development': 'utility' // Map development to utility for backward compatibility
};

export interface UtilityModConfig {
  id: string;
  displayName: string;
  description: string;
  category: UtilityModCategory;
  registryProjectName: string;
  compatibleLoaders: ModLoader[];
  defaultSelection: boolean;
  ui: {
    label: string;
    description?: string;
    group?: string;
    icon?: string;
  };
  versions: {
    templateVariable: string;
    versionExtraction: (data: EchoRegistryAPIResponse) => string | undefined;
  };
}

/**
 * Backward compatibility: Convert new DependencyConfig to legacy UtilityModConfig
 */
function dependencyToUtilityMod(dep: DependencyConfig): UtilityModConfig {
  return {
    id: dep.id,
    displayName: dep.displayName,
    description: dep.description,
    category: categoryMapping[dep.category] || 'utility',
    registryProjectName: dep.registryProjectName,
    compatibleLoaders: dep.compatibleLoaders,
    defaultSelection: dep.defaultSelection,
    ui: dep.ui,
    versions: dep.versions
  };
}

/**
 * Backward compatibility: Get only mod-type dependencies as utility mods
 * (Filters out libraries like Amber, Architectury API, etc.)
 */
export const UTILITY_MODS: UtilityModConfig[] = getDependenciesByType('mod')
  .map(dependencyToUtilityMod);

/**
 * Get utility mod configuration by ID
 */
export function getUtilityModConfig(id: string): UtilityModConfig | undefined {
  return UTILITY_MODS.find(mod => mod.id === id);
}

/**
 * Get utility mods that are compatible with a specific loader
 */
export function getUtilityModsForLoader(loader: ModLoader): UtilityModConfig[] {
  return UTILITY_MODS.filter(mod => mod.compatibleLoaders.includes(loader));
}

/**
 * Get utility mods by category
 */
export function getUtilityModsByCategory(category: UtilityModCategory): UtilityModConfig[] {
  return UTILITY_MODS.filter(mod => mod.category === category);
}

/**
 * Get all unique UI groups for organizing the multiselect interface
 */
export function getUtilityModGroups(): string[] {
  const groups = UTILITY_MODS
    .map(mod => mod.ui.group)
    .filter((group): group is string => group !== undefined);
  return [...new Set(groups)]; // Remove duplicates
}

/**
 * Get all registry project names for API requests
 */
export function getUtilityModProjectNames(): string[] {
  return UTILITY_MODS.map(mod => mod.registryProjectName);
}

/**
 * Check if a utility mod ID is valid
 */
export function isValidUtilityModId(id: string): boolean {
  return UTILITY_MODS.some(mod => mod.id === id);
}

/**
 * Validate an array of utility mod IDs
 */
export function validateUtilityModIds(ids: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const id of ids) {
    if (isValidUtilityModId(id)) {
      valid.push(id);
    } else {
      invalid.push(id);
    }
  }

  return { valid, invalid };
}