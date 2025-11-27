import {
	intro,
	outro,
	cancel,
	text,
	select,
	multiselect,
	isCancel,
	log,
} from "@clack/prompts";
import { inspect } from "util";
import { resolve } from "node:path";
import { parseArguments } from "./cli.js";
import { formatModId, formatPackageName, validateDestinationPath } from "./util.js";
import type { Mod } from "./types.js";
import { runPipeline } from "./core.js";

const args = parseArguments(process.argv);

if (args.help) {
	console.log(`
Usage: create-minecraft-mod [destination-path]

Arguments:
  destination-path    Path where the mod project should be created
                     (optional, will prompt if not provided)

Options:
  --help, -h         Show this help message

Examples:
  create-minecraft-mod ./my-awesome-mod
  create-minecraft-mod /home/user/projects/my-mod
  create-minecraft-mod
  `);
	process.exit(0);
}

const mod: Mod = {
	name: "",
	id: "",
	package: "",
	author: "",
	description: "",
	version: "",
	javaVersion: "",
	minecraftVersion: "",
	loaders: [],
	libraries: [],
	utility: [],
	samples: [],
	postActions: [],
	license: "",
	destinationPath: "",
};

intro("Time to create a mod!");

let destinationPath: string | undefined = args.destinationPath;

//
// ─── DESTINATION PATH ───────────────────────────────────────
//
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

	if (isCancel(destResult)) {
		cancel("Operation cancelled.");
		process.exit(0);
	}

	destinationPath = String(destResult);
} else {
	// Validate provided destination path
	const validation = validateDestinationPath(destinationPath);
	if (!validation.valid) {
		cancel(`Invalid destination path: ${validation.error}`);
		process.exit(1);
	}
}

mod.destinationPath = resolve(destinationPath!);

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

if (isCancel(modName)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.name = String(modName);

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

if (isCancel(author)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.author = String(author);

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

if (isCancel(description)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.description = String(description);

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

if (isCancel(version)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.version = String(version);

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

if (isCancel(javaVersion)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.javaVersion = String(javaVersion);

//
// ─── MOD ID ───────────────────────────────────────────────
//
const modId = await text({
	message: "Mod ID",
	placeholder: formatModId(mod.name),
	initialValue: formatModId(mod.name),
	validate(value) {
		const id = value.trim();
		if (!id) return "Mod ID cannot be empty.";
		if (!/^[a-z][a-z0-9-]*$/.test(id))
			return "Mod ID must match ^[a-z][a-z0-9-]*$";
		if (id.endsWith("-")) return "Mod ID cannot end with '-'.";
	},
});

if (isCancel(modId)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.id = String(modId);

//
// ─── PACKAGE NAME ─────────────────────────────────────────
//
const modPackage = await text({
	message: "Java Package",
	placeholder: formatPackageName(mod.name),
	initialValue: formatPackageName(mod.name),
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

if (isCancel(modPackage)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.package = String(modPackage);

//
// ─── MINECRAFT VERSION ────────────────────────────────────
//
const mcVersion = await select({
	message: "Minecraft Version",
	options: [
		{ value: "1.21.4", label: "1.21.4" },
		{ value: "1.21.2", label: "1.21.2" },
		{ value: "1.20.1", label: "1.20.1" },
	],
});

if (isCancel(mcVersion)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.minecraftVersion = String(mcVersion);

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

if (isCancel(loaders)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.loaders = loaders as string[];

//
// ─── LIBRARIES ────────────────────────────────────────────
//
const libraries = await multiselect({
	message: "Include Libraries?",
	options: [
		{ value: "amber", label: "Amber" },
		{ value: "cloth-config", label: "Cloth Config" },
		{ value: "architectury", label: "Architectury" },
	],
});

if (isCancel(libraries)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.libraries = libraries as string[];

//
// ─── UTILITY MODS ─────────────────────────────────────────
//
const utilityMods = await multiselect({
	message: "Optional Utility Mods",
  initialValues: ['modmenu'],
	options: [
		{ value: "modmenu", label: "Mod Menu (Fabric only)" },
		{ value: "jei", label: "JEI (Recipe Viewer)" },
		{ value: "jade", label: "Jade (Block Inspect Overlay)" },
	],
});

if (isCancel(utilityMods)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.utility = utilityMods as string[];

//
// ─── SAMPLE CODE ───────────────────────────────────────────
//
const samples = await multiselect({
	message: "Include Sample Code?",
	options: [
		{ value: "item-registration", label: "Item Registration" },
		{ value: "datagen", label: "Data Generation" },
		{ value: "commands", label: "Commands" },
		{ value: "mixin", label: "Mixin Example" },
	],
});

if (isCancel(samples)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.samples = samples as string[];

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

if (isCancel(license)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.license = String(license);

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

if (isCancel(postActions)) {
	cancel("Operation cancelled.");
	process.exit(0);
}

mod.postActions = postActions as string[];

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
