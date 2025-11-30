/**
 * Centralized API endpoint and URL management
 * This serves as the single source of truth for all external service URLs
 */

export const API_ENDPOINTS = {
  /**
   * Echo Registry API - provides latest versions of Minecraft modding dependencies
   */
  ECHO_REGISTRY: {
    BASE_URL: 'https://echo.iamkaf.com/api',
    VERSIONS: {
      /**
       * Build URL for fetching dependency versions
       * @param minecraftVersion - Minecraft version (e.g., "1.21.10")
       * @param projects - Array of project names to fetch versions for
       */
      DEPENDENCIES: (minecraftVersion: string, projects: string[]) =>
        `/versions/dependencies/${minecraftVersion}?projects=${projects.join(',')}`
    }
  },

  /**
   * GitHub API and repository URLs
   */
  GITHUB: {
    BASE_URL: 'https://github.com',
    API_BASE: 'https://api.github.com',
    PATTERNS: {
      /**
       * Generate repository URL
       * @param username - GitHub username or organization
       * @param repo - Repository name
       */
      REPO: (username: string, repo: string) => `https://github.com/${username}/${repo}`,

      /**
       * Generate repository issues URL
       * @param username - GitHub username or organization
       * @param repo - Repository name
       */
      ISSUES: (username: string, repo: string) => `https://github.com/${username}/${repo}/issues`,

      /**
       * Generate repository update.json URL
       * @param username - GitHub username or organization
       * @param repo - Repository name
       */
      UPDATE_JSON: (username: string, repo: string) => `https://github.com/${username}/${repo}/raw/main/updates.json`,

      /**
       * Generate raw file URL
       * @param username - GitHub username or organization
       * @param repo - Repository name
       * @param branch - Branch name (default: main)
       * @param path - File path within repository
       */
      RAW_FILE: (username: string, repo: string, branch: string = 'main', path: string) =>
        `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${path}`
    }
  },

  /**
   * Modrinth API and CDN URLs
   */
  MODRINTH: {
    BASE_URL: 'https://modrinth.com',
    API_BASE: 'https://api.modrinth.com/v2',
    CDN_BASE: 'https://cdn.modrinth.com'
  },

  /**
   * Maven repository URLs for Gradle builds
   */
  MAVEN_REPOSITORIES: {
    FABRIC: 'https://maven.fabricmc.net/',
    FORGE: 'https://maven.minecraftforge.net/',
    NEOFORGE: 'https://maven.neoforged.net/releases',
    SPONGE: 'https://repo.spongepowered.org/repository/maven-public',
    PARCHMENT: 'https://maven.parchmentmc.org/',
    BLAME_JARED: 'https://maven.blamejared.com',
    TERRAFORMERS: 'https://maven.terraformersmc.com/',
    MOD_RESOURCES: 'https://raw.githubusercontent.com/iamkaf/modresources/main/maven/',
    FIRST_DARK: 'https://maven.firstdark.dev/releases'
  }
} as const;

/**
 * URL builder functions for common patterns
 */
export const URL_BUILDERS = {
  /**
   * Build Echo Registry dependency versions URL
   */
  echoRegistryDependencies: (minecraftVersion: string, projects: string[]) =>
    `${API_ENDPOINTS.ECHO_REGISTRY.BASE_URL}${API_ENDPOINTS.ECHO_REGISTRY.VERSIONS.DEPENDENCIES(minecraftVersion, projects)}`,

  /**
   * Build Echo Registry compatibility URL
   */
  echoRegistryCompatibility: (minecraftVersion: string, projects: string[]) =>
    `${API_ENDPOINTS.ECHO_REGISTRY.BASE_URL}/projects/compatibility?projects=${projects.join(',')}&versions=${minecraftVersion}`,

  /**
   * Build GitHub repository URL
   */
  githubRepo: (username: string, repo: string) =>
    API_ENDPOINTS.GITHUB.PATTERNS.REPO(username, repo),

  /**
   * Build GitHub issues URL
   */
  githubIssues: (username: string, repo: string) =>
    API_ENDPOINTS.GITHUB.PATTERNS.ISSUES(username, repo),

  /**
   * Build GitHub update.json URL
   */
  githubUpdateJson: (username: string, repo: string) =>
    API_ENDPOINTS.GITHUB.PATTERNS.UPDATE_JSON(username, repo),

  /**
   * Build complete set of GitHub URLs for a mod
   */
  githubUrls: (username: string, repo: string) => ({
    repo: API_ENDPOINTS.GITHUB.PATTERNS.REPO(username, repo),
    issues: API_ENDPOINTS.GITHUB.PATTERNS.ISSUES(username, repo),
    updateJson: API_ENDPOINTS.GITHUB.PATTERNS.UPDATE_JSON(username, repo)
  }),

  /**
   * Build Modrinth project URL
   */
  modrinthProject: (projectId: string) =>
    `${API_ENDPOINTS.MODRINTH.BASE_URL}/mod/${projectId}`,

  /**
   * Build Modrinth download URL from CDN
   */
  modrinthDownload: (projectId: string, versionId: string, filename: string) =>
    `${API_ENDPOINTS.MODRINTH.CDN_BASE}/data/${projectId}/versions/${versionId}/${filename}`
};

/**
 * Get Echo Registry URL using the centralized URL builder
 * Uses the real production Echo Registry API
 */
export function getEchoRegistryUrl(minecraftVersion: string, projects: string[]) {
  return URL_BUILDERS.echoRegistryDependencies(minecraftVersion, projects);
}