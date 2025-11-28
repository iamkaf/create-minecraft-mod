// Echo Registry provides the latest versions of Forge, NeoForge, Fabric, and popular Minecraft mods through a simple REST API and web interface.
// https://echo.iamkaf.com/

import { getUtilityModProjectNames, getEchoRegistryUrl } from './config/index.js';

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
}

// url to download the jars
export interface DownloadUrls {
  forge: null | string;
  neoforge: null | string;
  fabric: null | string;
}

/*
Sample response:

{
  "data": {
    "mc_version": "1.21.10",
    "dependencies": [
      {
        "name": "forge",
        "loader": "forge",
        "version": "60.1.0",
        "mc_version": "1.21.10",
        "source_url": "https://files.minecraftforge.net/net/minecraftforge/forge/index_1.21.10.html",
        "notes": "Recommended",
        "fallback_used": false
      },
      {
        "name": "neoforge",
        "loader": "neoforge",
        "version": "21.10.56-beta",
        "mc_version": "1.21.10",
        "source_url": "https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml",
        "fallback_used": false
      },
      {
        "name": "fabric-loader",
        "loader": "fabric",
        "version": "0.18.1",
        "mc_version": "1.21.10",
        "source_url": "https://meta.fabricmc.net/v2/versions/loader/1.21.10",
        "fallback_used": false
      },
      {
        "name": "parchment",
        "loader": "universal",
        "version": "2025.10.12",
        "mc_version": "1.21.10",
        "source_url": "https://maven.parchmentmc.org/org/parchmentmc/data/parchment-1.21.10/",
        "fallback_used": false
      },
      {
        "name": "neoform",
        "loader": "universal",
        "version": "1.21.10-20251010.172816",
        "mc_version": "1.21.10",
        "source_url": "https://maven.neoforged.net/releases/net/neoforged/neoform/",
        "fallback_used": false
      },
      {
        "name": "moddev-gradle",
        "loader": "universal",
        "version": "2.0.120",
        "mc_version": "1.21.10",
        "source_url": "https://maven.neoforged.net/releases/net/neoforged/moddev-gradle/",
        "notes": "Version-agnostic Gradle plugin",
        "fallback_used": false
      },
      {
        "name": "forgegradle",
        "loader": "forge",
        "version": "6.0.46",
        "mc_version": "1.21.10",
        "source_url": "https://maven.minecraftforge.net/net/minecraftforge/gradle/ForgeGradle/",
        "notes": "Latest version",
        "fallback_used": false
      },
      {
        "name": "amber",
        "loader": "universal",
        "version": "8.1.0+1.21.10",
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/amber",
        "download_urls": {
          "forge": "https://cdn.modrinth.com/data/vjGZJDu5/versions/PGqE3qYc/amber-forge-8.1.0%2B1.21.10.jar",
          "neoforge": "https://cdn.modrinth.com/data/vjGZJDu5/versions/nTVYQWgu/amber-neoforge-8.1.0%2B1.21.10.jar",
          "fabric": "https://cdn.modrinth.com/data/vjGZJDu5/versions/znb3Rqld/amber-fabric-8.1.0%2B1.21.10.jar"
        },
        "fallback_used": false
      },
      {
        "name": "fabric-api",
        "loader": "fabric",
        "version": "0.138.3+1.21.10",
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/fabric-api",
        "download_urls": {
          "forge": null,
          "neoforge": null,
          "fabric": "https://cdn.modrinth.com/data/P7dR8mSH/versions/dQ3p80zK/fabric-api-0.138.3%2B1.21.10.jar"
        },
        "fallback_used": false
      },
      {
        "name": "modmenu",
        "loader": "fabric",
        "version": "16.0.0-rc.1",
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/modmenu",
        "download_urls": {
          "forge": null,
          "neoforge": null,
          "fabric": "https://cdn.modrinth.com/data/mOgUt4GM/versions/e0mxOOIE/modmenu-16.0.0-rc.1.jar"
        },
        "fallback_used": false
      },
      {
        "name": "rei",
        "loader": "universal",
        "version": null,
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/rei",
        "notes": "Failed to fetch: Error: No rei versions available",
        "fallback_used": false
      },
      {
        "name": "architectury-api",
        "loader": "universal",
        "version": "18.0.6+neoforge",
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/architectury-api",
        "download_urls": {
          "forge": null,
          "neoforge": "https://cdn.modrinth.com/data/lhGA9TYQ/versions/baQ6rP1K/architectury-18.0.6-neoforge.jar",
          "fabric": "https://cdn.modrinth.com/data/lhGA9TYQ/versions/8Ing3Dbx/architectury-18.0.6-fabric.jar"
        },
        "fallback_used": false
      },
      {
        "name": "forge-config-api-port",
        "loader": "universal",
        "version": "21.10.1",
        "mc_version": "1.21.10",
        "source_url": "https://modrinth.com/mod/forge-config-api-port",
        "download_urls": {
          "forge": "https://cdn.modrinth.com/data/ohNO6lps/versions/kLEEctaG/ForgeConfigAPIPort-v21.10.1%2Bmc1.21.10-Forge.jar",
          "neoforge": "https://cdn.modrinth.com/data/ohNO6lps/versions/bRP8ISG1/ForgeConfigAPIPort-v21.10.1%2Bmc1.21.10-NeoForge.jar",
          "fabric": "https://cdn.modrinth.com/data/ohNO6lps/versions/IKHTwwTv/ForgeConfigAPIPort-v21.10.1%2Bmc1.21.10-Fabric.jar"
        },
        "fallback_used": false
      }
    ]
  },
  "timestamp": "2025-11-26T23:48:11.125Z",
  "cached_at": "2025-11-26T23:48:11.125Z"
}*/

type McVersion = string;

export async function fetchDependencyVersions(
  minecraftVersion: string = "1.21.10"
): Promise<EchoRegistryAPIResponse> {
  // Get utility mod project names from configuration (single source of truth)
  const utilityModProjects = getUtilityModProjectNames();

  // Core library projects that are always needed (independent of utility mods)
  const coreProjects = ['amber', 'fabric-api', 'architectury-api', 'forge-config-api-port'];

  // Combine core projects with utility mod projects
  const allProjects = [...coreProjects, ...utilityModProjects];

  // Use centralized URL builder
  const apiUrl = getEchoRegistryUrl(minecraftVersion, allProjects);

  const response = await fetch(apiUrl);
  const data = await response.json();
  return data as EchoRegistryAPIResponse;
}
