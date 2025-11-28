import type { Mod } from './types.js';
import { getDependencyConfig } from './config/index.js';

/**
 * Validation and warning system for dependency compatibility issues
 */

export interface ValidationWarning {
  type: 'error' | 'warning';
  category: 'architectury-forge' | 'minecraft-compatibility' | 'loader-compatibility';
  message: string;
  suggestion?: string;
  preventGeneration?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
}

/**
 * Parse Minecraft version to compare versions
 */
function parseMinecraftVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.replace(/^1\./, '').split('.').map(Number);
  return {
    major: 1,
    minor: parts[0] || 0,
    patch: parts[1] || 0
  };
}

/**
 * Check if Minecraft version is after the Architectury Forge cutoff
 */
function isMinecraftVersionAfterForgeCutoff(version: string): boolean {
  const parsed = parseMinecraftVersion(version);
  // Architectury Forge is only available up to 1.20.4
  return parsed.minor > 20 || (parsed.minor === 20 && parsed.patch > 4);
}

/**
 * Validate Architectury API + Forge combination
 * Architectury API is not available for Forge 1.20.5+
 */
export function validateArchitecturyForgeCompatibility(mod: Mod): ValidationResult {
  const warnings: ValidationWarning[] = [];

  // Check if Architectury API is selected
  if (!mod.libraries.includes('architectury')) {
    return { valid: true, warnings };
  }

  // Check if Forge is selected
  if (!mod.loaders.includes('forge')) {
    return { valid: true, warnings };
  }

  // Check Minecraft version
  if (isMinecraftVersionAfterForgeCutoff(mod.minecraftVersion)) {
    const config = getDependencyConfig('architectury');
    const warning: ValidationWarning = {
      type: 'error',
      category: 'architectury-forge',
      message: `Architectury API is not available for Forge on Minecraft ${mod.minecraftVersion}`,
      suggestion: 'Use NeoForge instead of Forge for Minecraft 1.20.5+ when using Architectury API',
      preventGeneration: true
    };

    // Check if NeoForge is also selected as an alternative
    const hasNeoForge = mod.loaders.includes('neoforge');
    if (hasNeoForge) {
      warning.message += '\n✓ NeoForge is also selected, which is compatible';
      warning.preventGeneration = false;
      warnings.push({
        type: 'warning',
        category: 'architectury-forge',
        message: `Architectury API will only work with NeoForge (not Forge) on Minecraft ${mod.minecraftVersion}`,
        suggestion: 'Remove Forge from loaders to use only NeoForge with Architectury API'
      });
    } else {
      warnings.push(warning);
    }
  }

  return {
    valid: !warnings.some(w => w.preventGeneration),
    warnings
  };
}

/**
 * Validate general dependency compatibility
 */
export function validateDependencyCompatibility(mod: Mod): ValidationResult {
  const warnings: ValidationWarning[] = [];

  // Validate each selected dependency
  for (const dependencyId of [...mod.libraries, ...mod.mods]) {
    const config = getDependencyConfig(dependencyId);
    if (!config) continue;

    // Check loader compatibility
    const compatibleLoaders = mod.loaders.filter(loader =>
      config.compatibleLoaders.includes(loader as any)
    );

    if (compatibleLoaders.length === 0) {
      warnings.push({
        type: 'error',
        category: 'loader-compatibility',
        message: `${config.displayName} is not compatible with any selected loaders`,
        suggestion: `Add a compatible loader: ${config.compatibleLoaders.join(', ')}`,
        preventGeneration: true
      });
    } else if (compatibleLoaders.length < mod.loaders.length) {
      const incompatibleLoaders = mod.loaders.filter(loader =>
        !config.compatibleLoaders.includes(loader as any)
      );
      warnings.push({
        type: 'warning',
        category: 'loader-compatibility',
        message: `${config.displayName} will only work with: ${compatibleLoaders.join(', ')}`,
        suggestion: `Remove incompatible loaders: ${incompatibleLoaders.join(', ')}`
      });
    }
  }

  return {
    valid: !warnings.some(w => w.preventGeneration),
    warnings
  };
}

/**
 * Comprehensive validation of mod configuration
 */
export function validateModConfiguration(mod: Mod): ValidationResult {
  const allWarnings: ValidationWarning[] = [];

  // Run all validation checks
  const architecturyResult = validateArchitecturyForgeCompatibility(mod);
  const compatibilityResult = validateDependencyCompatibility(mod);

  allWarnings.push(...architecturyResult.warnings);
  allWarnings.push(...compatibilityResult.warnings);

  return {
    valid: architecturyResult.valid && compatibilityResult.valid,
    warnings: allWarnings
  };
}

/**
 * Format warnings for console output
 */
export function formatWarnings(warnings: ValidationWarning[]): string {
  if (warnings.length === 0) {
    return '';
  }

  let output = '';

  warnings.forEach((warning, index) => {
    const icon = warning.type === 'error' ? '❌' : '⚠️';
    output += `\n${icon} ${warning.message}\n`;

    if (warning.suggestion) {
      output += `   💡 Suggestion: ${warning.suggestion}\n`;
    }

    if (index < warnings.length - 1) {
      output += '\n';
    }
  });

  return output;
}

/**
 * Log warnings to console with appropriate styling
 */
export async function logWarnings(warnings: ValidationWarning[]): Promise<void> {
  if (warnings.length === 0) return;

  const { log } = await import('@clack/prompts');

  warnings.forEach(warning => {
    const message = `${warning.message}${warning.suggestion ? `\n💡 Suggestion: ${warning.suggestion}` : ''}`;

    if (warning.type === 'error') {
      log.error(message);
    } else {
      log.warn(message);
    }
  });
}