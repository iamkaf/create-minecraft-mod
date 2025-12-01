/**
 * Basic information collection prompts
 *
 * Handles collection of destination path, mod name, author, description,
 * version, and Java version from the user.
 */

import { intro, text, select } from "@clack/prompts";
import { resolve } from "node:path";
import { validateDestinationPath } from "../../util.js";
import { handleCancellation, validateResult } from '../utils.js';
import type { BasicInfoResult } from '../types.js';

/**
 * Collect basic information from the user
 *
 * @param initialDestination - Optional initial destination path from CLI args
 * @returns Basic configuration information
 */
export async function collectBasicInfo(initialDestination?: string): Promise<BasicInfoResult> {
	intro("Time to create a mod!");

	//
	// ─── DESTINATION PATH ───────────────────────────────────────
	//
	let destinationPath: string | undefined = initialDestination;

	if (!destinationPath) {
		const destResult = await text({
			message: "Where should the mod be created?",
			placeholder: "./my-mod",
			validate(value) {
				if (!value.trim()) return "Destination path cannot be empty.";

				const validation = validateDestinationPath(value.trim());
				if (!validation.valid) return validation.error;
			},
		});

		destinationPath = validateResult(destResult);
	} else {
		// Validate provided destination path
		const validation = validateDestinationPath(destinationPath);
		if (!validation.valid) {
			handleCancellation(`Invalid destination path: ${validation.error}`);
		}
	}

	const resolvedDestinationPath = resolve(destinationPath!);

	//
	// ─── MOD NAME ─────────────────────────────────────────────
	//
	const modName = await text({
		message: "Mod Name",
		placeholder: "My Mod",
		validate(value) {
			if (!value.trim()) return "Mod name cannot be empty.";
		},
	});

	const name = validateResult(modName);

	//
	// ─── AUTHOR NAME ───────────────────────────────────────────
	//
	const author = await text({
		message: "Author Name",
		placeholder: "Your Name",
		validate(value) {
			if (!value.trim()) return "Author name cannot be empty.";
		},
	});

	const authorName = validateResult(author);

	//
	// ─── MOD DESCRIPTION ───────────────────────────────────────
	//
	const description = await text({
		message: "Mod Description",
		placeholder: "A brief description of your mod",
		validate(value) {
			if (!value.trim()) return "Description cannot be empty.";
			if (value.length > 200) return "Description should be under 200 characters.";
		},
	});

	const modDescription = validateResult(description);

	//
	// ─── MOD VERSION ─────────────────────────────────────────────
	//
	const version = await text({
		message: "Initial Version",
		placeholder: "1.0.0",
		initialValue: "1.0.0",
		validate(value) {
			if (!value.trim()) return "Version cannot be empty.";
			if (!/^\d+\.\d+\.\d+/.test(value))
				return "Version should follow semantic versioning (e.g., 1.0.0)";
		},
	});

	const modVersion = validateResult(version);

	//
	// ─── JAVA VERSION ────────────────────────────────────────────
	//
	const javaVersion = await select({
		message: "Java Version",
		options: [
			{ value: "21", label: "Java 21 (Recommended)" },
			{ value: "17", label: "Java 17" },
		],
		initialValue: "21",
	});

	const selectedJavaVersion = validateResult(javaVersion);

	return {
		destinationPath: resolvedDestinationPath,
		name,
		author: authorName,
		description: modDescription,
		version: modVersion,
		javaVersion: selectedJavaVersion,
	};
}