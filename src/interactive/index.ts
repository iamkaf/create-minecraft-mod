/**
 * Interactive mode coordinator
 *
 * This module orchestrates all interactive prompts and builds the complete Mod configuration.
 * Following the successful patterns from Phase 1 utility extraction.
 */

import { inspect } from "util";
import { log, outro, cancel } from "@clack/prompts";
import type { Mod } from '../types.js';
import { validateModConfiguration, logWarnings } from '../warnings.js';
import { runPipeline } from '../pipeline-runner.js';
import type { InteractiveOptions } from './types.js';
import { configToMod } from './types.js';
import {
	collectBasicInfo,
	collectTechnicalSettings,
	collectDependencies,
	collectOptionalFeatures,
} from './prompts/index.js';

/**
 * Run the interactive mode and collect all user configuration
 *
 * @param options - Optional configuration including initial destination path
 * @returns Complete Mod configuration ready for pipeline execution
 */
export async function runInteractiveMode(options?: InteractiveOptions): Promise<Mod> {
	// Collect configuration step by step
	const basicInfo = await collectBasicInfo(options?.destinationPath);
	const technical = await collectTechnicalSettings(basicInfo);
	const dependencies = await collectDependencies(technical.minecraftVersion);
	const optional = await collectOptionalFeatures();

	// Combine all configuration
	const config = {
		...basicInfo,
		...technical,
		...dependencies,
		...optional,
	};

	// Convert to Mod object
	const mod = configToMod(config);

	// Validate and run
	await validateAndRun(mod);

	return mod;
}

/**
 * Validate configuration and run the pipeline
 *
 * @param mod - The complete Mod configuration
 */
async function validateAndRun(mod: Mod): Promise<void> {
	const validationResult = validateModConfiguration(mod);

	if (!validationResult.valid) {
		// Show errors and stop
		log.warn("Configuration validation failed:");
		await logWarnings(validationResult.warnings);
		cancel("❌ Cannot proceed with invalid configuration");
		process.exit(1);
	}

	if (validationResult.warnings.length > 0) {
		// Show warnings but continue
		log.warn("Configuration warnings detected:");
		await logWarnings(validationResult.warnings);
	}

	//
	// ─── DONE ─────────────────────────────────────────────────
	//
	log.success(`Creating mod with config:\n${inspect(mod, false, null, true)}`);

	try {
		await runPipeline(mod);
		outro("✅ Mod created successfully! Time to start developing.");
	} catch (error) {
		cancel(`❌ Failed to create mod: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	}
}