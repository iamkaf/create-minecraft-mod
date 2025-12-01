/**
 * Dependencies collection prompts
 *
 * Handles collection of loaders, libraries, and utility mods.
 * Includes automatic foundation dependency inclusion based on selected loaders.
 */

import { multiselect } from "@clack/prompts";
import { UTILITY_MODS, getLibraryDependencies } from "../../config/index.js";
import { validateResults } from '../utils.js';

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

/**
 * Collect dependencies from the user
 *
 * @param minecraftVersion - The selected Minecraft version for compatibility
 * @returns Dependency configuration
 */
export async function collectDependencies(_minecraftVersion: string): Promise<DependenciesResult> {
	//
	// ─── LOADERS ──────────────────────────────────────────────
	//
	const loaders = await multiselect({
		message: "Select Mod Loaders",
		required: true,
		initialValues: ['fabric'],
		options: [
			{ value: "fabric", label: "Fabric" },
			{ value: "neoforge", label: "NeoForge" },
			{ value: "forge", label: "Forge" },
		],
	});

	const selectedLoaders = validateResults(loaders);

	//
	// ─── LIBRARIES ────────────────────────────────────────────
	//
	// Generate library options from the new dependencies configuration
	const getLibraryOptions = () => {
		return getLibraryDependencies()
			.sort((a, b) => a.displayName.localeCompare(b.displayName))
			.map(lib => {
				const option: { value: string; label: string; hint?: string } = {
					value: lib.id,
					label: lib.ui.label
				};
				if (lib.ui.description) {
					option.hint = lib.ui.description;
				}
				return option;
			});
	};

	const libraries = await multiselect({
		message: "Include Optional Libraries?",
		options: getLibraryOptions(),
		initialValues: getLibraryDependencies()
			.filter(lib => lib.defaultSelection)
			.map(lib => lib.id),
	});

	const selectedLibraries = validateResults(libraries);

	// Auto-include foundation dependencies based on selected loaders
	const { getFoundationDependencies } = await import('../../config/dependencies.js');
	const foundationDeps = getFoundationDependencies()
		.filter(dep => dep.compatibleLoaders.some(loader => selectedLoaders.includes(loader)))
		.map(dep => dep.id);

	// Combine foundation (auto-included) + user-selected libraries
	const allLibraries = [...foundationDeps, ...selectedLibraries];

	// Auto-included foundation dependencies are handled transparently
	// Foundation dependencies are automatically included based on selected loaders
	// This provides the necessary build tools without user intervention

	//
	// ─── UTILITY MODS ─────────────────────────────────────────
	//
	// Generate multiselect options from configuration with improved UX
	const getUtilityModOptions = () => {
		// Create organized options by group with enhanced descriptions
		return UTILITY_MODS
			.sort((a, b) => {
				// Sort by group first, then by display name within each group
				if (a.ui.group !== b.ui.group) {
					return (a.ui.group || '').localeCompare(b.ui.group || '');
				}
				return a.displayName.localeCompare(b.displayName);
			})
			.map(mod => {
				const option: { value: string; label: string; hint?: string } = {
					value: mod.id,
					label: mod.ui.label
				};
				if (mod.ui.description) {
					option.hint = mod.ui.description;
				}
				return option;
			});
	};

	const utilityMods = await multiselect({
		message: "Optional Utility Mods",
		initialValues: UTILITY_MODS
			.filter(mod => mod.defaultSelection)
			.map(mod => mod.id),
		options: getUtilityModOptions(),
	});

	const selectedMods = validateResults(utilityMods);

	return {
		loaders: selectedLoaders,
		libraries: allLibraries,
		mods: selectedMods,
	};
}