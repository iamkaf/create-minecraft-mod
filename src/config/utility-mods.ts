import type { EchoRegistryAPIResponse } from '../echo-registry.js';

export type ModLoader = 'fabric' | 'forge' | 'neoforge';
export type UtilityModCategory = 'utility' | 'performance' | 'recipe-viewer' | 'integration';

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
 * Helper function to find version in Echo Registry response
 */
function findVersion(data: EchoRegistryAPIResponse, projectName: string): string | undefined {
  const dependency = data.data.dependencies.find(dep => dep.name === projectName);
  return dependency?.version || undefined;
}

/**
 * Master configuration for all utility mods
 * This serves as the single source of truth for utility mod data
 */
export const UTILITY_MODS: UtilityModConfig[] = [
  {
    id: 'modmenu',
    displayName: 'Mod Menu',
    description: 'In-game mod configuration menu',
    category: 'utility',
    registryProjectName: 'modmenu',
    compatibleLoaders: ['fabric'], // Note: Only works on Fabric based on current mappings
    defaultSelection: true,
    ui: {
      label: '🔧 Mod Menu',
      description: 'Configure mods in-game with a clean interface',
      group: 'Utilities'
    },
    versions: {
      templateVariable: 'mod_menu_version',
      versionExtraction: (data) => findVersion(data, 'modmenu')
    }
  },
  {
    id: 'jei',
    displayName: 'Just Enough Items',
    description: 'Recipe and item information viewer',
    category: 'recipe-viewer',
    registryProjectName: 'jei',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    ui: {
      label: '📖 JEI - Recipe Viewer',
      description: 'View item recipes, uses, and properties',
      group: 'Recipe Viewers'
    },
    versions: {
      templateVariable: 'jei_version',
      versionExtraction: (data) => findVersion(data, 'jei')
    }
  },
  {
    id: 'rei',
    displayName: 'Roughly Enough Items',
    description: 'Recipe and item information viewer',
    category: 'recipe-viewer',
    registryProjectName: 'rei',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    ui: {
      label: '📚 REI - Recipe Viewer',
      description: 'View item recipes and usage information',
      group: 'Recipe Viewers'
    },
    versions: {
      templateVariable: 'rei_version',
      versionExtraction: (data) => findVersion(data, 'rei')
    }
  },
  {
    id: 'jade',
    displayName: 'Jade HUD',
    description: 'Block and entity information overlay',
    category: 'utility',
    registryProjectName: 'jade',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    ui: {
      label: '💎 Jade - Block Inspector',
      description: 'Show block and entity information on hover',
      group: 'Utilities'
    },
    versions: {
      templateVariable: 'jade_version',
      versionExtraction: (data) => findVersion(data, 'jade')
    }
  },
  {
    id: 'sodium',
    displayName: 'Sodium',
    description: 'Performance optimization mod',
    category: 'performance',
    registryProjectName: 'sodium',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    ui: {
      label: '⚡ Sodium - Performance',
      description: 'Major performance improvements and optimizations',
      group: 'Performance'
    },
    versions: {
      templateVariable: 'sodium_version',
      versionExtraction: (data) => findVersion(data, 'sodium')
    }
  }
];

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