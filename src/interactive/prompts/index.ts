/**
 * Barrel exports for interactive prompts
 */

export { collectBasicInfo } from './basic-info.js';
export { collectTechnicalSettings } from './technical.js';
export { collectDependencies } from './dependencies.js';
export { collectOptionalFeatures } from './optional.js';

export type {
	BasicInfoResult,
	DependenciesResult,
	OptionalResult
} from '../types.js';

export type { TechnicalResult } from './technical.js';