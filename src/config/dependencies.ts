import type { EchoRegistryAPIResponse } from '../echo-registry.js';

export type ModLoader = 'fabric' | 'forge' | 'neoforge';
export type DependencyType = 'library' | 'mod';
export type DependencyCategory = 'utility' | 'performance' | 'recipe-viewer' | 'integration' | 'development';

export interface MavenRepository {
  id: string;
  name: string;
  url: string;
}

export interface MavenCoordinates {
  common?: string;
  fabric?: string;
  forge?: string;
  neoforge?: string;
}

export interface DependencyConfig {
  id: string;
  displayName: string;
  description: string;
  type: DependencyType;
  category: DependencyCategory;
  registryProjectName: string;
  compatibleLoaders: ModLoader[];
  defaultSelection: boolean;
  repository: MavenRepository | null;
  coordinates: MavenCoordinates;
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
 * Maven Repository Definitions
 */
export const MAVEN_REPOSITORIES: Record<string, MavenRepository> = {
  'kaf-mod-resources': {
    id: 'kaf-mod-resources',
    name: 'Kaf Mod Resources',
    url: 'https://raw.githubusercontent.com/iamkaf/modresources/main/maven/'
  },
      'modrinth': {
    id: 'modrinth',
    name: 'Modrinth',
    url: 'https://api.modrinth.com/maven'
  }
};

/**
 * Helper function to find version in Echo Registry response
 */
function findVersion(data: EchoRegistryAPIResponse, projectName: string): string | undefined {
  const dependency = data.data.dependencies.find(dep => dep.name === projectName);
  return dependency?.version || undefined;
}

/**
 * Master configuration for all dependencies
 * This serves as the single source of truth for dependency data
 */
export const DEPENDENCIES: DependencyConfig[] = [
  // Foundation Dependencies (Always Present)
  {
    id: 'fabric-api',
    displayName: 'Fabric API',
    description: 'Core Fabric modding API (Foundation Dependency)',
    type: 'library',
    category: 'development',
    registryProjectName: 'fabric-api',
    compatibleLoaders: ['fabric'],
    defaultSelection: true,
    repository: null, // Uses Fabric Maven repository
    coordinates: {
      fabric: 'net.fabricmc.fabric-api:fabric-api'
    },
    ui: {
      label: '🧵 Fabric API',
      description: 'Core Fabric modding framework (required)',
      group: 'Foundation'
    },
    versions: {
      templateVariable: 'fabric_version',
      versionExtraction: (data) => findVersion(data, 'fabric-api')
    }
  },

  // Libraries (Development Dependencies)
  {
    id: 'fabric-loom',
    displayName: 'Fabric Loom',
    description: 'Fabric modding build tool',
    type: 'library',
    category: 'development',
    registryProjectName: 'loom',
    compatibleLoaders: ['fabric'],
    defaultSelection: true,
    repository: null,
    coordinates: {
      fabric: 'net.fabricmc:fabric-loom'
    },
    ui: {
      label: '🔧 Fabric Loom',
      description: 'Fabric modding build tool',
      group: 'Libraries'
    },
    versions: {
      templateVariable: 'fabric_loom_version',
      versionExtraction: (data) => findVersion(data, 'loom')
    }
  },
  {
    id: 'moddevgradle',
    displayName: 'NeoForge ModDevGradle',
    description: 'NeoForge modding build tool plugin',
    type: 'library',
    category: 'development',
    registryProjectName: 'moddev-gradle',
    compatibleLoaders: ['neoforge'],
    defaultSelection: true,
    repository: null,
    coordinates: {
      neoforge: 'net.neoforged:moddevgradle'
    },
    ui: {
      label: '🔧 ModDevGradle',
      description: 'NeoForge modding build tool plugin',
      group: 'Libraries'
    },
    versions: {
      templateVariable: 'moddevgradle_version',
      versionExtraction: (data) => findVersion(data, 'moddev-gradle')
    }
  },
  {
    id: 'amber',
    displayName: 'Amber',
    description: 'Modding utilities and common code',
    type: 'library',
    category: 'development',
    registryProjectName: 'amber',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: true,
    repository: MAVEN_REPOSITORIES['kaf-mod-resources'],
    coordinates: {
      common: 'com.iamkaf.amber:amber-common',
      fabric: 'com.iamkaf.amber:amber-fabric',
      forge: 'com.iamkaf.amber:amber-forge',
      neoforge: 'com.iamkaf.amber:amber-neoforge'
    },
    ui: {
      label: '🔧 Amber',
      description: 'Modding utilities and common code',
      group: 'Libraries'
    },
    versions: {
      templateVariable: 'amber_version',
      versionExtraction: (data) => findVersion(data, 'amber')
    }
  },
  
  // Mods (Runtime Dependencies)
  {
    id: 'modmenu',
    displayName: 'Mod Menu',
    description: 'In-game mod configuration menu',
    type: 'mod',
    category: 'utility',
    registryProjectName: 'modmenu',
    compatibleLoaders: ['fabric'],
    defaultSelection: true,
    repository: MAVEN_REPOSITORIES['modrinth'],
    coordinates: {
      fabric: 'maven.modrinth:modmenu'
    },
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
    type: 'mod',
    category: 'recipe-viewer',
    registryProjectName: 'jei',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    repository: MAVEN_REPOSITORIES['modrinth'],
    coordinates: {
      fabric: 'maven.modrinth:jei',
      forge: 'maven.modrinth:jei',
      neoforge: 'maven.modrinth:jei'
    },
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
    type: 'mod',
    category: 'recipe-viewer',
    registryProjectName: 'rei',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    repository: MAVEN_REPOSITORIES['modrinth'],
    coordinates: {
      fabric: 'maven.modrinth:rei',
      forge: 'maven.modrinth:rei',
      neoforge: 'maven.modrinth:rei'
    },
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
    type: 'mod',
    category: 'utility',
    registryProjectName: 'jade',
    compatibleLoaders: ['fabric', 'forge', 'neoforge'],
    defaultSelection: false,
    repository: MAVEN_REPOSITORIES['modrinth'],
    coordinates: {
      fabric: 'maven.modrinth:jade',
      forge: 'maven.modrinth:jade',
      neoforge: 'maven.modrinth:jade'
    },
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
    type: 'mod',
    category: 'performance',
    registryProjectName: 'sodium',
    compatibleLoaders: ['fabric', 'neoforge'], // Note: Forge has different Sodium rendering
    defaultSelection: false,
    repository: MAVEN_REPOSITORIES['modrinth'],
    coordinates: {
      fabric: 'maven.modrinth:sodium',
      neoforge: 'maven.modrinth:sodium'
    },
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
 * Dependency Configuration Access Functions
 */

/**
 * Get dependency configuration by ID
 */
export function getDependencyConfig(id: string): DependencyConfig | undefined {
  return DEPENDENCIES.find(dep => dep.id === id);
}

/**
 * Get dependencies that are compatible with a specific loader
 */
export function getDependenciesForLoader(loader: ModLoader): DependencyConfig[] {
  return DEPENDENCIES.filter(dep => dep.compatibleLoaders.includes(loader));
}

/**
 * Get dependencies by type
 */
export function getDependenciesByType(type: DependencyType): DependencyConfig[] {
  return DEPENDENCIES.filter(dep => dep.type === type);
}

/**
 * Get dependencies by category
 */
export function getDependenciesByCategory(category: DependencyCategory): DependencyConfig[] {
  return DEPENDENCIES.filter(dep => dep.category === category);
}

/**
 * Get all unique UI groups for organizing the multiselect interface
 */
export function getDependencyGroups(): string[] {
  const groups = DEPENDENCIES
    .map(dep => dep.ui.group)
    .filter((group): group is string => group !== undefined);
  return [...new Set(groups)]; // Remove duplicates
}

/**
 * Get all registry project names for API requests
 */
export function getDependencyProjectNames(): string[] {
  return DEPENDENCIES.map(dep => dep.registryProjectName);
}

/**
 * Check if a dependency ID is valid
 */
export function isValidDependencyId(id: string): boolean {
  return DEPENDENCIES.some(dep => dep.id === id);
}

/**
 * Validate an array of dependency IDs
 */
export function validateDependencyIds(ids: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const id of ids) {
    if (isValidDependencyId(id)) {
      valid.push(id);
    } else {
      invalid.push(id);
    }
  }

  return { valid, invalid };
}

/**
 * Get library dependencies for selection options
 */
export function getLibraryDependencies(): DependencyConfig[] {
  return getDependenciesByType('library');
}

/**
 * Get mod dependencies for selection options
 */
export function getModDependencies(): DependencyConfig[] {
  return getDependenciesByType('mod');
}

/**
 * Get unique repositories required by selected dependencies
 */
export function getRequiredRepositories(dependencyIds: string[]): MavenRepository[] {
  const repositories = new Set<MavenRepository>();

  for (const id of dependencyIds) {
    const config = getDependencyConfig(id);
    if (config?.repository) {
      repositories.add(config.repository);
    }
  }

  return Array.from(repositories);
}