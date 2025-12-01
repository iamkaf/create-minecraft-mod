/**
 * Optional features collection prompts
 *
 * Handles collection of sample code options, license selection,
 * and post-creation actions.
 */

import { multiselect, select } from "@clack/prompts";
import { validateResult, validateResults } from '../utils.js';

export interface OptionalResult {
	samples: string[];
	license: string;
	postActions: string[];
}

/**
 * Collect optional features from the user
 *
 * @returns Optional configuration
 */
export async function collectOptionalFeatures(): Promise<OptionalResult> {
	//
	// ─── SAMPLE CODE ───────────────────────────────────────────
	//
	const samples = await multiselect({
		message: "Include Sample Code?",
		options: [
			{ value: "none", label: "None - Start with empty project" },
			{ value: "item-registration", label: "Item Registration" },
			{ value: "datagen", label: "Data Generation" },
			{ value: "commands", label: "Commands" },
			{ value: "mixin", label: "Mixin Example" },
		],
	});

	const allSamples = validateResults(samples);

	// Filter out "none" option - users can now start with empty project
	const selectedSamples = allSamples.filter(sample => sample !== "none");

	//
	// ─── LICENSE ──────────────────────────────────────────────
	//
	const license = await select({
		message: "License",
		options: [
			{ value: "mit", label: "MIT" },
			{ value: "lgpl", label: "LGPL" },
			{ value: "arr", label: "All Rights Reserved" },
		],
	});

	const selectedLicense = validateResult(license);

	//
	// ─── POST-CREATION ACTIONS ─────────────────────────────────
	//
	const postActions = await multiselect({
		message: "Post-Creation Actions",
		options: [
			{ value: "git-init", label: "Initialize Git Repository" },
			{ value: "run-gradle", label: "Run Gradle Build" },
			{ value: "open-vscode", label: "Open in VS Code" },
			{ value: "open-intellij", label: "Open in IntelliJ IDEA" },
		],
	});

	const selectedPostActions = validateResults(postActions);

	return {
		samples: selectedSamples,
		license: selectedLicense,
		postActions: selectedPostActions,
	};
}