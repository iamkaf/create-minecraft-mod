/**
 * Types and interfaces for the interactive mode module
 */

import type { Mod } from '../types.js';

export interface BasicInfoResult {
	destinationPath: string;
	name: string;
	author: string;
	description: string;
	version: string;
	javaVersion: string;
}

export interface TechnicalResult {
	modId: string;
	packageName: string;
	minecraftVersion: string;
}

export interface DependenciesResult {
	loaders: string[];
	libraries: string[];
	mods: string[];
}

export interface OptionalResult {
	samples: string[];
	license: string;
	gradleVersion: string;
	postActions: string[];
}

export interface InteractiveOptions {
	destinationPath?: string | undefined;
}

/**
 * Result of collecting all interactive configuration
 */
export interface InteractiveConfig extends BasicInfoResult, TechnicalResult, DependenciesResult, OptionalResult {
	// The combined configuration that builds a Mod object
}

/**
 * Convert the interactive configuration to a Mod object
 */
export function configToMod(config: InteractiveConfig): Mod {
	return {
		destinationPath: config.destinationPath,
		name: config.name,
		author: config.author,
		description: config.description,
		version: config.version,
		javaVersion: config.javaVersion,
		id: config.modId,
		package: config.packageName,
		minecraftVersion: config.minecraftVersion,
		loaders: config.loaders,
		libraries: config.libraries,
		mods: config.mods,
		samples: config.samples,
		license: config.license,
		gradleVersion: config.gradleVersion,
		postActions: config.postActions,
	};
}