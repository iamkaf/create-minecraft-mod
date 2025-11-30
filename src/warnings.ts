import type { Mod } from './types.js';
import { getDependencyConfig } from './config/index.js';

/**
 * Validation and warning system for dependency compatibility issues
 */

export interface ValidationWarning {
  type: 'error' | 'warning';
  category: 'minecraft-compatibility' | 'loader-compatibility';
  message: string;
  suggestion?: string;
  preventGeneration?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
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
    }
    // No compatibility warnings needed - as long as there's at least one compatible loader,
    // the conditional template logic will handle it correctly
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

  // Run dependency compatibility check
  const compatibilityResult = validateDependencyCompatibility(mod);
  allWarnings.push(...compatibilityResult.warnings);

  return {
    valid: compatibilityResult.valid,
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