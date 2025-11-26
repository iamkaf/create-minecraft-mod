import { resolve, dirname } from "node:path";
import { accessSync, constants, readdirSync, existsSync, mkdirSync } from "node:fs";

export function formatModName(input: string) {
	// Title Case
	return input
		.trim()
		.split(/\s+/)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join(" ");
}

export function formatModClass(input: string) {
	// Remove accents, symbols, spaces → PascalCase
	return input
		.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // accents
		.replace(/[^a-zA-Z0-9\s]/g, " ")                  // symbols → space
		.split(/\s+/)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
		.join("");
}

export function formatModId(input: string) {
	// kebab-case, lowercase, safe for mod loaders
	return input
		.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // accents
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, " ") // symbols → space
		.replace(/\s+/g, "-")         // spaces → hyphens
		.replace(/-+/g, "-");         // collapse repeats
}

export function formatPackageName(input: string) {
	// Normalize to lowercase
	let value = input
		.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
		.toLowerCase()
		.trim();

	// Replace invalid separators with dots
	value = value.replace(/[^a-z0-9.]+/g, ".");

	// Collapse multiple dots
	value = value.replace(/\.+/g, ".");

	// Remove leading/trailing dot
	value = value.replace(/^\.+|\.+$/g, "");

	// Ensure every segment starts with a letter
	const segments = value.split(".").map(seg => {
		// Remove invalid characters
		seg = seg.replace(/[^a-z0-9]/g, "");

		// If segment doesn't start with a letter, prefix it with one
		if (!/^[a-z]/.test(seg)) {
			seg = "x" + seg;
		}

		return seg;
	});

	return segments.join(".");
}

export function validateDestinationPath(path: string): { valid: boolean; error?: string } {
	try {
		const resolvedPath = resolve(path);

		// Check if parent directory exists and is writable
		const parentDir = dirname(resolvedPath);

		// Parent directory must exist and be writable
		accessSync(parentDir, constants.W_OK);

		// If directory already exists, it must be empty
		if (existsSync(resolvedPath)) {
			const files = readdirSync(resolvedPath);
			if (files.length > 0) {
				return {
					valid: false,
					error: `Directory "${resolvedPath}" already exists and is not empty`
				};
			}
		}

		return { valid: true };
	} catch (error) {
		return {
			valid: false,
			error: `Cannot write to destination "${path}": ${error instanceof Error ? error.message : String(error)}`
		};
	}
}

export function ensureDirectoryExists(path: string): void {
	const dir = dirname(path);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

