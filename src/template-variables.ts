import type { Mod } from "./types.js";
import { fetchDependencyVersions, fetchCompatibilityVersions, type EchoRegistryAPIResponse, type CompatibilityResponse } from "./echo-registry.js";
import { UTILITY_MODS, type UtilityModConfig, URL_BUILDERS, getDependencyConfig, getLibraryDependencies, getModDependencies, getDependencyProjectNames } from "./config/index.js";
import { extractCleanVersion } from "./echo-registry.js";

/**
 * Complete template variable data structure for Minecraft mod generation
 * Based on TEMPLATE_VARIABLE_REPORT.md analysis of 70+ variables
 */

export interface TemplateVariables {
	// Core Project Identity Variables
	mod_name: string;
	mod_id: string;
	mod_author: string;
	year: string;
	description: string;
	group: string;
	version: string;
	license: string;
	credits: string;

	// Build Tool Version Variables
	gradle_version: string;
	fabric_loom_version: string;
	moddevgradle_version: string;
	modpublisher_version: string;
	forgegradle_version: string;
	mixin_version: string;
	toolchains_resolver_version: string;

	// Java/Minecraft Configuration
	java_version: string;
	java_compatibility_level: string;
	minecraft_version: string;
	minecraft_version_range: string;
	fabric_version_range: string;

	// Development Tool Versions
	fabric_version: string;
	fabric_loader_version: string;
	forge_version: string;
	forge_loader_version_range: string;
	neoforge_version: string;
	neoforge_loader_version_range: string;
	neo_form_version: string;
	parchment_minecraft: string;
	parchment_version: string;
	mod_menu_version: string;
	amber_version: string | undefined; // Legacy single version (from its own repository, not Modrinth)
	rei_version: string | undefined; // Legacy single version (will be migrated later)

	// Loader-specific versions for dependencies
	jei_version_fabric?: string | undefined;
	jei_version_forge?: string | undefined;
	jei_version_neoforge?: string | undefined;

	jade_version_fabric?: string | undefined;
	jade_version_forge?: string | undefined;
	jade_version_neoforge?: string | undefined;

	sodium_version_fabric?: string | undefined;
	sodium_version_forge?: string | undefined;
	sodium_version_neoforge?: string | undefined;

	rei_version_fabric?: string | undefined;
	rei_version_forge?: string | undefined;
	rei_version_neoforge?: string | undefined;

	mod_menu_version_fabric?: string | undefined;
	mod_menu_version_forge?: string | undefined;
	mod_menu_version_neoforge?: string | undefined;
	
	// Publishing/Release Variables
	curse_id: string;
	modrinth_id: string;
	release_type: string;
	game_versions: string;
	mod_environment: string;
	dry_run: boolean;
	mod_modrinth_depends: string;
	mod_curse_depends: string;

	// Loader Selection Variables
	fabric: boolean;
	forge: boolean;
	neoforge: boolean;

	// Java Package Structure Variables
	package_base: string;
	package_path: string;
	main_class_name: string;
	fabric_entry_class: string;
	forge_entry_class: string;
	neoforge_entry_class: string;
	constants_class_name: string;
	datagen_class_name: string;

	// Content Creation Variables (Future)
	first_block_name?: string;
	first_item_name?: string;
	tab_group_name?: string;
	tab_display_name?: string;

	// Service Interface Variables
	platform_helper_interface: string;
	fabric_platform_helper: string;
	forge_platform_helper: string;
	neoforge_platform_helper: string;

	// DataGen Provider Variables
	block_tag_provider_class: string;
	item_tag_provider_class: string;
	block_loot_provider_class: string;
	model_provider_class: string;
	recipe_provider_class: string;

	// Configuration File Variables
	mixin_min_version: string;
	mixin_package: string;
	pack_format_version: string;
	mixin_refmap_name: string;

	// Repository and URL Variables
	github_url: string;
	issue_tracker_url: string;
	update_json_url: string;
	homepage_url: string;
}

/**
 * Helper function to extract loader-specific versions from compatibility API data
 */
const extractLoaderVersions = (
	compatibilityData: CompatibilityResponse['data'],
	projectSlug: string,
	minecraftVersion: string
) => {
	const projectData = compatibilityData[projectSlug]?.[minecraftVersion];
	if (!projectData) return {};

	return {
		fabric_version: projectData.fabric || "NOT_AVAILABLE",
		forge_version: projectData.forge || "NOT_AVAILABLE",
		neoforge_version: projectData.neoforge || "NOT_AVAILABLE",
		supports_fabric: projectData.fabric !== null,
		supports_forge: projectData.forge !== null,
		supports_neoforge: projectData.neoforge !== null
	};
};

/**
 * Default values for template variables
 */
export const DEFAULT_VARIABLES: Partial<TemplateVariables> = {
	// Build Tool Versions (current template values)
	gradle_version: "8.14",
	fabric_loom_version: "1.11-SNAPSHOT",
	moddevgradle_version: "2.0.97",
	modpublisher_version: "2.1.6",
	forgegradle_version: "[6.0.24,6.2)",
	mixin_version: "0.7-SNAPSHOT",
	toolchains_resolver_version: "0.8.0",

	// Java/Minecraft defaults
	java_version: "21",
	minecraft_version: "1.21.10",
	minecraft_version_range: "[1.21.10, 1.22)",
	fabric_version_range: ">=1.21.10",

	// Configuration defaults
	mixin_min_version: "0.8",
	pack_format_version: "8",

	// Publishing defaults
	release_type: "release",
	mod_environment: "both",
	dry_run: true,
	game_versions: "1.21.10",

	// Default service class names
	platform_helper_interface: "IPlatformHelper",

	// Default credits (can be empty)
	credits: "",

	// Default placeholders for URLs
	github_url: "https://github.com/yourusername/your-mod",
	issue_tracker_url: "https://github.com/yourusername/your-mod/issues",
	update_json_url: "https://github.com/yourusername/your-mod/updates.json",
	homepage_url: "https://github.com/yourusername/your-mod",

	// Default project IDs (placeholders)
	curse_id: "000000",
	modrinth_id: "AAAAAAAA",
};

/**
 * Generates derived template variables from user input and API data
 */
export async function generateTemplateVariables(mod: Mod): Promise<TemplateVariables> {
	// Generate package structure variables
	const package_base = mod.package;
	const package_path = mod.package.replace(/\./g, '/');

	// Generate class names based on mod name
	const toPascalCase = (str: string): string => {
		return str.replace(/(?:^|\s)\w/g, (char) => char.toUpperCase()).replace(/\s+/g, '');
	};
	const modNamePascal = toPascalCase(mod.name);

	const main_class_name = `${modNamePascal}Mod`;
	const constants_class_name = `${modNamePascal}Constants`;
	const fabric_entry_class = `${modNamePascal}Fabric`;
	const forge_entry_class = `${modNamePascal}Forge`;
	const neoforge_entry_class = `${modNamePascal}NeoForge`;
	const datagen_class_name = `ModDatagen`;

	// Generate platform helper class names
	const fabric_platform_helper = `FabricPlatformHelper`;
	const forge_platform_helper = `ForgePlatformHelper`;
	const neoforge_platform_helper = `NeoForgePlatformHelper`;

	// Generate DataGen class names
	const block_tag_provider_class = `ModBlockTagProvider`;
	const item_tag_provider_class = `ModItemTagProvider`;
	const block_loot_provider_class = `ModBlockLootTableProvider`;
	const model_provider_class = `ModModelProvider`;
	const recipe_provider_class = `ModRecipeProvider`;

	// Generate mixin variables
	const mixin_package = `${mod.package}.mixin`;
	const mixin_refmap_name = `${mod.id}.refmap.json`;
	const java_compatibility_level = `JAVA_${mod.javaVersion}`;

	// Get project names for requested mods only
	const requestedModProjects = mod.mods
		.map(modId => getDependencyConfig(modId)?.registryProjectName)
		.filter((name): name is string => name !== undefined);

	// Try to fetch compatibility information from Echo Registry for requested mods only
	let compatibilityData = {} as CompatibilityResponse['data'];
	try {
		const compatibilityResponse = await fetchCompatibilityVersions(mod.minecraftVersion, requestedModProjects);
		compatibilityData = compatibilityResponse.data;
	} catch (error) {
		console.warn(`Failed to fetch compatibility data: ${error}`);
		// Fallback to existing single-version system
	}

	// Also fetch loader/core versions from legacy API for now
	let fetchedVersions = {} as EchoRegistryAPIResponse;
	try {
		fetchedVersions = await fetchDependencyVersions(mod.minecraftVersion);
	} catch (error) {
		console.warn(`Failed to fetch dependency versions: ${error}`);
	}

	// Extract version information from Echo Registry response
	const data = fetchedVersions.data;
	const dependencies = data?.dependencies || [];

	// Helper to find version by name
	const findVersion = (name: string): string | undefined => {
		const dep = dependencies.find((d: any) => d.name === name);
		return dep?.version || undefined;
	};

	// Extract versions from API or use defaults
	const minecraft_version = data?.mc_version || mod.minecraftVersion;
	const fabric_version = findVersion("fabric-api") || "";
	const fabric_loader_version = findVersion("fabric-loader") || "";
	const forge_version = findVersion("forge") || "";
	const neoforge_version = findVersion("neoforge") || "";
	const neo_form_version = findVersion("neoform") || "";
	const parchment_minecraft = findVersion("parchment") ? minecraft_version : "";
	const parchment_version = findVersion("parchment") || "";

	// Configuration-driven dependency version extraction
	// This eliminates repetitive code and provides single source of truth
	const extractDependencyVersion = (config: UtilityModConfig): string | undefined => {
		const isInMods = mod.mods.includes(config.id);
		const isInLibraries = mod.libraries.includes(config.id);

		// Include this dependency if it's selected in mods or libraries
		if (!isInMods && !isInLibraries) {
			return undefined;
		}

		// Use the configuration's version extraction function
		return config.versions.versionExtraction(fetchedVersions);
	};

	// Extract versions for all runtime mods using new dependency system with Maven coordinate extraction
	const extractModVersion = (modId: string, registryName: string): string | undefined => {
		if (!mod.mods.includes(modId)) return undefined;

		const dependency = dependencies.find(d => d.name === registryName);
		if (!dependency?.coordinates) return findVersion(registryName);

		// Extract clean version from Maven coordinates
		return extractCleanVersion(dependency.coordinates);
	};

	// Library versions using the new dependency system with Maven coordinate extraction
	const extractLibraryVersion = (libraryId: string, registryName: string): string | undefined => {
		if (!mod.libraries.includes(libraryId)) return undefined;

		const dependency = dependencies.find(d => d.name === registryName);
		if (!dependency?.coordinates) return findVersion(registryName);

		// Extract clean version from Maven coordinates
		return extractCleanVersion(dependency.coordinates);
	};

	// Extract loader-specific versions for requested mods using compatibility API
	const getLoaderVersions = (modId: string, registryProjectName: string) => {
		if (!mod.mods.includes(modId)) return {};
		return extractLoaderVersions(compatibilityData, registryProjectName, mod.minecraftVersion);
	};

	const jeiLoaderData = getLoaderVersions("jei", "jei");
	const jadeLoaderData = getLoaderVersions("jade", "jade");
	const sodiumLoaderData = getLoaderVersions("sodium", "sodium");
	const reiLoaderData = getLoaderVersions("rei", "rei");
	const modmenuLoaderData = getLoaderVersions("modmenu", "modmenu");

	// Amber uses its own repository, not Modrinth - use legacy system
	const amber_version = extractLibraryVersion("amber", "amber");

	// Use compatibility API for all runtime mods (REI and Mod Menu now consistent)
	const mod_menu_version = modmenuLoaderData.fabric_version || undefined;
	const rei_version = reiLoaderData.fabric_version || undefined;

	// Calculate version ranges
	const calculateMinecraftRange = (version: string): string => {
		if (!version) return "[1.21.10, 1.22)"; // fallback

		const parts = version.split('.');
		const major = parts[0];
		const minor = parts[1];
		if (!major || !minor) return "[1.21.10, 1.22)"; // fallback for malformed version
		return `[${version}, ${major}.${parseInt(minor) + 1})`;
	};

	const calculateForgeRange = (version: string): string => {
		if (!version) return "[55,)"; // fallback
		const match = version.match(/^(\d+)/);
		return match ? `[${match[1]},)` : "[55,)";
	};

	const calculateNeoForgeRange = (version: string): string => {
		if (!version) return "[4,)"; // fallback
		const match = version.match(/^(\d+)/);
		return match ? `[${match[1]},)` : "[4,)";
	};

	// Generate dependency strings for all selected libraries
	const generateLibraryDependencies = (libraries: string[]) => {
		if (libraries.length === 0) {
			return { modrinth: '""', curse: '""' };
		}

		const modrinthDeps: string[] = [];
		const curseDeps: string[] = [];

		for (const libId of libraries) {
			const config = getDependencyConfig(libId);
			if (config && !config.foundation && config.type === 'library') {
				// Only include user-selected library dependencies, not foundation dependencies or runtime mods
				// Add Modrinth dependency ID
				modrinthDeps.push(libId);

				// Add Curse dependency ID (typically libId + "-lib" pattern)
				// Can be customized per library if needed in the future
				curseDeps.push(`${libId}-lib`);
			}
		}

		return {
			modrinth: modrinthDeps.join(","),
			curse: curseDeps.join(",")
		};
	};

	const libraryDeps = generateLibraryDependencies(mod.libraries);
	const mod_modrinth_depends = libraryDeps.modrinth;
	const mod_curse_depends = libraryDeps.curse;

	// Generate dynamic GitHub URLs using configuration-driven URL builders
	// This replaces hardcoded placeholder URLs with patterns based on mod information
	const githubUrls = URL_BUILDERS.githubUrls(mod.author.toLowerCase().replace(/\s+/g, '.'), mod.id);

	return {
		// Core Project Identity (from user input)
		mod_name: mod.name,
		mod_id: mod.id,
		mod_author: mod.author,
		year: new Date().getFullYear().toString(),
		description: mod.description,
		group: mod.package,
		version: `${mod.version}+${minecraft_version}`,
		license: mod.license,
		credits: DEFAULT_VARIABLES.credits!,

		// Build Tool Versions
		gradle_version: mod.gradleVersion || DEFAULT_VARIABLES.gradle_version!,
		fabric_loom_version: mod.fabricLoomVersion || findVersion("loom") || DEFAULT_VARIABLES.fabric_loom_version!,
		moddevgradle_version: findVersion("moddev-gradle") || DEFAULT_VARIABLES.moddevgradle_version!,
		modpublisher_version: DEFAULT_VARIABLES.modpublisher_version!,
		forgegradle_version: DEFAULT_VARIABLES.forgegradle_version!,
		mixin_version: DEFAULT_VARIABLES.mixin_version!,
		toolchains_resolver_version: DEFAULT_VARIABLES.toolchains_resolver_version!,

		// Java/Minecraft Configuration
		java_version: mod.javaVersion,
		java_compatibility_level,
		minecraft_version,
		minecraft_version_range: calculateMinecraftRange(minecraft_version),
		fabric_version_range: `>=${minecraft_version}`,

		// Development Tool Versions (from API or defaults)
		fabric_version: fabric_version || "",
		fabric_loader_version: fabric_loader_version || "",
		forge_version: forge_version || "",
		forge_loader_version_range: calculateForgeRange(forge_version || "55.0.1"),
		neoforge_version: neoforge_version || "",
		neoforge_loader_version_range: calculateNeoForgeRange(neoforge_version || "21.0.0"),
		neo_form_version: neo_form_version || "",
		parchment_minecraft,
		parchment_version: parchment_version || "",
		mod_menu_version: mod_menu_version || "",
		rei_version,
		amber_version, // Legacy single version for Amber (not from Modrinth)

		// Loader-specific versions (passing through full versions with suffixes)

		jei_version_fabric: jeiLoaderData.fabric_version,
		jei_version_forge: jeiLoaderData.forge_version,
		jei_version_neoforge: jeiLoaderData.neoforge_version,

		jade_version_fabric: jadeLoaderData.fabric_version,
		jade_version_forge: jadeLoaderData.forge_version,
		jade_version_neoforge: jadeLoaderData.neoforge_version,

		sodium_version_fabric: sodiumLoaderData.fabric_version,
		sodium_version_forge: sodiumLoaderData.forge_version,
		sodium_version_neoforge: sodiumLoaderData.neoforge_version,

		rei_version_fabric: reiLoaderData.fabric_version,
		rei_version_forge: reiLoaderData.forge_version,
		rei_version_neoforge: reiLoaderData.neoforge_version,

		mod_menu_version_fabric: modmenuLoaderData.fabric_version,
		mod_menu_version_forge: modmenuLoaderData.forge_version,
		mod_menu_version_neoforge: modmenuLoaderData.neoforge_version,

		// Publishing/Release Variables
		curse_id: DEFAULT_VARIABLES.curse_id!,
		modrinth_id: DEFAULT_VARIABLES.modrinth_id!,
		release_type: DEFAULT_VARIABLES.release_type!,
		game_versions: minecraft_version,
		mod_environment: DEFAULT_VARIABLES.mod_environment!,
		dry_run: DEFAULT_VARIABLES.dry_run!,
		mod_modrinth_depends,
		mod_curse_depends,

		// Java Package Structure Variables
		package_base,
		package_path,
		main_class_name,
		fabric_entry_class,
		forge_entry_class,
		neoforge_entry_class,
		constants_class_name,
		datagen_class_name,

		// Service Interface Variables
		platform_helper_interface: DEFAULT_VARIABLES.platform_helper_interface!,
		fabric_platform_helper,
		forge_platform_helper,
		neoforge_platform_helper,

		// DataGen Provider Variables
		block_tag_provider_class,
		item_tag_provider_class,
		block_loot_provider_class,
		model_provider_class,
		recipe_provider_class,

		// Configuration File Variables
		mixin_min_version: DEFAULT_VARIABLES.mixin_min_version!,
		mixin_package,
		pack_format_version: DEFAULT_VARIABLES.pack_format_version!,
		mixin_refmap_name,

		// Repository and URL Variables (now dynamically generated)
		github_url: githubUrls.repo,
		issue_tracker_url: githubUrls.issues,
		update_json_url: githubUrls.updateJson,
		homepage_url: githubUrls.repo,

		// Loader Selection Variables
		fabric: mod.loaders.includes("fabric"),
		forge: mod.loaders.includes("forge"),
		neoforge: mod.loaders.includes("neoforge"),
	};
}