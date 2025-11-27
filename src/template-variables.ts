import type { Mod } from "./types.js";
import { fetchDependencyVersions, type EchoRegistryAPIResponse } from "./echo-registry.js";

/**
 * Complete template variable data structure for Minecraft mod generation
 * Based on TEMPLATE_VARIABLE_REPORT.md analysis of 70+ variables
 */

export interface TemplateVariables {
	// Core Project Identity Variables
	mod_name: string;
	mod_id: string;
	mod_author: string;
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
	amber_version: string | undefined; // Optional
	cloth_config_version: string | undefined; // Optional
	architectury_api_version: string | undefined; // Optional
	jei_version: string | undefined; // Optional
	jade_version: string | undefined; // Optional
	forge_config_api_port_version: string | undefined; // Optional

	// Publishing/Release Variables
	curse_id: string;
	modrinth_id: string;
	release_type: string;
	game_versions: string;
	mod_environment: string;
	dry_run: boolean;
	mod_modrinth_depends: string;
	mod_curse_depends: string;

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
	minecraft_version: "1.21.4",
	minecraft_version_range: "[1.21.4, 1.22)",
	fabric_version_range: ">=1.21.4",

	// Configuration defaults
	mixin_min_version: "0.8",
	pack_format_version: "8",

	// Publishing defaults
	release_type: "release",
	mod_environment: "both",
	dry_run: true,
	game_versions: "1.21.4",

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
	const datagen_class_name = `${modNamePascal}Datagen`;

	// Generate platform helper class names
	const fabric_platform_helper = `${modNamePascal}PlatformHelper`;
	const forge_platform_helper = `${modNamePascal}PlatformHelper`;
	const neoforge_platform_helper = `${modNamePascal}PlatformHelper`;

	// Generate DataGen class names
	const block_tag_provider_class = `${modNamePascal}BlockTagProvider`;
	const item_tag_provider_class = `${modNamePascal}ItemTagProvider`;
	const block_loot_provider_class = `${modNamePascal}BlockLootTableProvider`;
	const model_provider_class = `${modNamePascal}ModelProvider`;
	const recipe_provider_class = `${modNamePascal}RecipeProvider`;

	// Generate mixin variables
	const mixin_package = `${mod.package}.mixin`;
	const mixin_refmap_name = `${mod.id}.refmap.json`;
	const java_compatibility_level = `JAVA_${mod.javaVersion}`;

	// Try to fetch version information from Echo Registry
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
	const mod_menu_version = findVersion("modmenu") || "";
	const amber_version = mod.libraries.includes("amber") ? findVersion("amber") : undefined;
	const cloth_config_version = mod.libraries.includes("cloth-config") ? findVersion("forge-config-api-port") : undefined;
	const architectury_api_version = mod.libraries.includes("architectury") ? findVersion("architectury-api") : undefined;
	const jei_version = mod.utility.includes("jei") ? findVersion("rei") : undefined;
	const jade_version = mod.utility.includes("jade") ? findVersion("jade") : undefined;
	const forge_config_api_port_version = mod.libraries.includes("forge-config-api-port") ? findVersion("forge-config-api-port") : undefined;

	// Calculate version ranges
	const calculateMinecraftRange = (version: string): string => {
		if (!version) return "[1.21.4, 1.22)"; // fallback

		const parts = version.split('.');
		const major = parts[0];
		const minor = parts[1];
		if (!major || !minor) return "[1.21.4, 1.22)"; // fallback for malformed version
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

	// Generate dependency strings
	const hasAmber = mod.libraries.includes("amber");
	const mod_modrinth_depends = hasAmber ? "amber" : "";
	const mod_curse_depends = hasAmber ? "amber-lib" : "";

	return {
		// Core Project Identity (from user input)
		mod_name: mod.name,
		mod_id: mod.id,
		mod_author: mod.author,
		description: mod.description,
		group: mod.package,
		version: `${mod.version}+${minecraft_version}`,
		license: mod.license,
		credits: DEFAULT_VARIABLES.credits!,

		// Build Tool Versions
		gradle_version: DEFAULT_VARIABLES.gradle_version!,
		fabric_loom_version: DEFAULT_VARIABLES.fabric_loom_version!,
		moddevgradle_version: DEFAULT_VARIABLES.moddevgradle_version!,
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
		amber_version,
		cloth_config_version,
		architectury_api_version,
		jei_version,
		jade_version,
		forge_config_api_port_version,

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

		// Repository and URL Variables
		github_url: DEFAULT_VARIABLES.github_url!,
		issue_tracker_url: DEFAULT_VARIABLES.issue_tracker_url!,
		update_json_url: DEFAULT_VARIABLES.update_json_url!,
		homepage_url: DEFAULT_VARIABLES.homepage_url!,
	};
}