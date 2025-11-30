// Echo Registry provides the latest versions of Forge, NeoForge, Fabric, and popular Minecraft mods through a simple REST API and web interface.
// https://echo.iamkaf.com/

import { getUtilityModProjectNames, getEchoRegistryUrl, getDependencyProjectNames } from './config/index.js';
import { URL_BUILDERS } from './config/api-urls.js';

export interface EchoRegistryAPIResponse {
  data: Data;
  timestamp: Date;
  cached_at: Date;
}

export interface Data {
  mc_version: McVersion;
  dependencies: Dependency[];
}

export interface Dependency {
  name: string;
  loader: "fabric" | "neoforge" | "forge" | "universal"; // don't rely on this to decide which mods can go on which loader
  version: null | string;
  mc_version: McVersion;
  source_url: string;
  notes?: string;
  fallback_used: boolean;
  download_urls?: DownloadUrls;
  coordinates?: string; // Maven coordinates for Modrinth Maven integration
}

// url to download the jars
export interface DownloadUrls {
  forge: null | string;
  neoforge: null | string;
  fabric: null | string;
}

type McVersion = string;

export interface CompatibilityResponse {
  data: Record<string, Record<string, LoaderVersions>>;
  success: boolean;
  timestamp: Date;
  cached_at: Date;
}

export interface LoaderVersions {
  forge: string | null;
  neoforge: string | null;
  fabric: string | null;
}

/**
 * Extract clean version from Maven coordinates by removing loader suffixes
 * Used to generate gradle.properties variables
 *
 * Handles both legacy (-loader) and current (+loader) suffix formats:
 * - "18.0.6+neoforge" → "18.0.6"
 * - "20.0.149+fabric" → "20.0.149"
 * - "1.0.0-forge" → "1.0.0"
 * - "group:artifact:18.0.6+neoforge" → "18.0.6"
 */
export function extractCleanVersion(coordinates?: string): string | undefined {
  if (!coordinates) return undefined;

  // Extract version part after the last colon
  const version = coordinates.split(':').pop();
  if (!version) return undefined;

  // Remove any existing loader suffixes (both -loader and +loader formats)
  // Handle patterns like: "18.0.6+neoforge", "20.0.149+fabric", "1.0.0-forge"
  return version.replace(/[+-](fabric|neoforge|forge)$/, '');
}

/**
 * Process Maven coordinates for template variable generation
 * Returns clean version for gradle.properties and handles loader suffixes in templates
 */
export function processMavenCoordinates(
  coordinates?: string,
  loader?: 'fabric' | 'forge' | 'neoforge'
): {
  cleanVersion?: string;
  templateVariable?: string;
} {
  const cleanVersion = extractCleanVersion(coordinates);

  if (!cleanVersion) {
    return {};
  }

  // For template variables, we'll use the clean version
  // Template files will handle adding loader suffixes
  return {
    cleanVersion,
    templateVariable: cleanVersion
  };
}

export async function fetchDependencyVersions(
  minecraftVersion: string = "1.21.10"
): Promise<EchoRegistryAPIResponse> {
  // Get all dependency project names from the new configuration system
  const allProjects = getDependencyProjectNames();

  // Use centralized URL builder
  const apiUrl = getEchoRegistryUrl(minecraftVersion, allProjects);

  const response = await fetch(apiUrl);
  const data = await response.json();
  return data as EchoRegistryAPIResponse;
}

export async function fetchCompatibilityVersions(
  minecraftVersion: string,
  projects: string[]
): Promise<CompatibilityResponse> {
  const apiUrl = URL_BUILDERS.echoRegistryCompatibility(minecraftVersion, projects);

  const response = await fetch(apiUrl);
  const data = await response.json();
  return data as CompatibilityResponse;
}
