/**
 * Technical settings collection prompts
 *
 * Handles collection of mod ID, package name, and Minecraft version.
 * Uses smart defaults based on previously collected basic information.
 */

import { text, select } from "@clack/prompts";
import { formatModId, createSmartPackageDefault } from "../../util.js";
import { validateResult } from '../utils.js';
import type { BasicInfoResult } from '../types.js';

export interface TechnicalResult {
	modId: string;
	packageName: string;
	minecraftVersion: string;
}

/**
 * Collect technical settings from the user
 *
 * @param basicInfo - Previously collected basic information for smart defaults
 * @returns Technical configuration
 */
export async function collectTechnicalSettings(basicInfo: Pick<BasicInfoResult, 'name' | 'author'>): Promise<TechnicalResult> {
	//
	// ─── MOD ID ───────────────────────────────────────────────
	//
	const modId = await text({
		message: "Mod ID",
		placeholder: formatModId(basicInfo.name),
		initialValue: formatModId(basicInfo.name),
		validate(value) {
			const id = value.trim();
			if (!id) return "Mod ID cannot be empty.";
			if (!/^[a-z][a-z0-9-]*$/.test(id))
				return "Mod ID must match ^[a-z][a-z0-9-]*$";
			if (id.endsWith("-")) return "Mod ID cannot end with '-'.";
		},
	});

	const finalModId = validateResult(modId);

	//
	// ─── PACKAGE NAME ─────────────────────────────────────────
	//
	const modPackage = await text({
		message: "Java Package",
		placeholder: createSmartPackageDefault(basicInfo.author, basicInfo.name),
		initialValue: createSmartPackageDefault(basicInfo.author, basicInfo.name),
		validate(value) {
			const pkg = value.trim();

			if (!pkg) return "Package name cannot be empty.";
			if (!/^[a-z0-9.]+$/.test(pkg))
				return "Package name must contain only lowercase letters, digits, and dots.";
			if (pkg.startsWith(".") || pkg.endsWith("."))
				return "Package name cannot start or end with a dot.";
			if (pkg.includes(".."))
				return "Package name cannot contain consecutive dots.";

			const segments = pkg.split(".");
			for (const seg of segments) {
				if (!/^[a-z][a-z0-9]*$/.test(seg))
					return "Each segment must start with a letter and contain only lowercase letters or digits.";
			}
		},
	});

	const packageName = validateResult(modPackage);

	//
	// ─── MINECRAFT VERSION ────────────────────────────────────
	//
	const mcVersion = await select({
		message: "Minecraft Version",
		options: [
			{ value: "1.21.10", label: "1.21.10" },
			{ value: "1.21.1", label: "1.21.1" },
			{ value: "1.20.1", label: "1.20.1" },
		],
	});

	const minecraftVersion = validateResult(mcVersion);

	return {
		modId: finalModId,
		packageName,
		minecraftVersion,
	};
}