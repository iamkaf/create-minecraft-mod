# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run start  # Executes via tsx: npx tsx ./src/index.ts
```

### Testing and Verification
Currently no test framework is set up. Manual verification involves creating test mods:

```bash
# Create a test mod to verify functionality
cd /tmp && npx create-minecraft-mod test-mod --ci-mode --name "Test Mod" --author "Test" --id "testmod"

# Verify with comprehensive build test
cd test-mod && ./gradlew build
```

## Architecture Overview

This is a sophisticated Node.js CLI tool that generates Minecraft mod projects from configurable templates. The architecture follows a modular pipeline pattern with three distinct operation modes, comprehensive dependency management, and real-time version fetching.

### Operation Modes

**Interactive Mode** (`src/index.ts`)
- Default mode with user prompts using @clack/prompts
- Collects comprehensive mod configuration via guided interface
- Real-time validation with warnings and error handling
- Supports all features including dependency selection and post-creation actions

**Headless Mode** (`src/headless-mode.ts`)
- Non-interactive mode for CI/automation using CLI flags
- Requires all configuration via command-line arguments
- JSON/text output options for CI/CD integration
- Validates configuration before processing

**Config Mode** (`src/config-mode.ts`)
- JSON file-based configuration for reproducible builds
- Supports batch processing and version-controlled configurations
- CLI override capability for flexible deployment
- Comprehensive validation with detailed error messages

### Core Components

**Pipeline System** (`src/pipeline.ts`, `src/pipeline-runner.ts`)
- `PipelineRunner` class with step-by-step execution and timing
- 16+ pipeline stages with comprehensive error handling
- Key pipeline functions: `cloneTemplate()`, `transformPackageStructure()`, `applyTemplateVariables()`, `renameClassFiles()`
- Real-time progress tracking and structured result reporting

**CLI Module** (`src/cli.ts`)
- Minimal argument parsing without external dependencies
- Supports positional destination path argument and comprehensive flags
- Provides help system and usage examples

**Configuration Management** (`src/config/`)
- **Dependencies** (`dependencies.ts`): Three-tier system with Maven repository integration
- **Utility Mods** (`utility-mods.ts`): Backward compatibility layer for runtime mods
- **API URLs** (`api-urls.ts`): Centralized endpoint management with URL builders

**Template System**
- Templates stored in `templates/` directory: `base/`, `loaders/`, `license/`
- Uses Handlebars for variable substitution: `{{variable}}` format (CLI), `${variable}` format (Gradle)
- 100% Handlebars coverage verified across 43+ template files
- Dynamic package structure transformation (`com/example/modtemplate/` → user package)

**Template Variables** (`src/template-variables.ts`)
- Comprehensive interface with 70+ variables for mod configuration
- Integrates with Echo Registry API for real-time addon version fetching
- Handles Maven coordinate extraction and loader-specific versioning
- Dynamic GitHub URL generation based on mod configuration

**Echo Registry Integration** (`src/echo-registry.ts`)
- Fetches latest versions from official Echo Registry API (`https://echo.iamkaf.com/api`)
- Dual API system: versions endpoint and compatibility endpoint
- Supports major addons: JEI, Jade, Sodium, Mod Menu, Amber, etc.
- Handles coordinate parsing and version normalization with loader suffix support

### Dependency Architecture

The CLI implements a sophisticated three-tier dependency management system:

**Foundation Dependencies** (Always Present)
- Required for building and running projects
- Examples: Forge, Fabric Loader, NeoForge, Fabric API, Gradle plugins
- Managed entirely by Gradle, automatically included
- Fabric Loom version auto-fetched from Echo Registry with manual override support

**Libraries** (Optional, Become Required)
- Development libraries that add functionality once selected
- Current: Amber (Kaf Mod Resources integration)
- Uses development Maven repositories (NOT Modrinth Maven):
  - Kaf Mod Resources: `https://raw.githubusercontent.com/iamkaf/modresources/main/maven/`

**Runtime Mods** (Optional, Removable)
- Utility mods for development experience that remain optional
- Examples: JEI, Jade, Sodium, Mod Menu, REI
- Uses Modrinth Maven with `exclusiveContent` repository configuration
- Conditionalized with clean build.gradle generation via buildSrc dynamic processing

### Template Processing Pipeline

The pipeline executes these steps in sequence:

1. **Template Cloning** (`cloneTemplate`)
   - Copies base template and selected loader modules
   - Preserves directory structure and all necessary files

2. **Package Transformation** (`transformPackageStructure`)
   - Renames template package directories to user package
   - Updates Java package declarations and imports throughout codebase
   - Cleans up empty template directories

3. **Class Renaming** (`renameClassFiles`)
   - Renames template classes (TemplateMod → UserModMod, etc.)
   - Updates all internal class references and file names
   - Handles DataGen class naming with mod ID prefix

4. **Mixin File Processing** (`renameMixinFiles`)
   - Renames mixin configuration files from template to mod-specific names
   - Updates all mixin JSON files across subprojects

5. **Service Registration** (`generateServiceRegistrationFiles`)
   - Creates META-INF/services files for platform abstraction
   - Generates loader-specific service registrations
   - Cleans up template service files

6. **Template Variable Application** (`applyTemplateVariables`)
   - Processes all text files through Handlebars template engine
   - Applies 70+ variables including versions, URLs, and project metadata
   - Preserves Gradle `${variable}` format for build-time substitution

7. **Configuration and Content**
   - `configureLoaders()`: Validates loader configuration
   - `installLibraries()`: Configures library dependencies via templates
   - `installUtilityMods()`: Sets up runtime mod dependencies
   - `addSampleCode()`: Placeholder for future sample code injection system
   - `applyLicense()`: Applies selected license with Handlebars processing

8. **Post-Creation Actions**
   - `initializeGit()`: Sets up Git repository with initial commit
   - `runGradle()`: Executes Gradle build with real-time output streaming
   - `openInVSCode()`, `openInIntelliJ()`: IDE integration with background execution

### Key Technical Details

**TypeScript Configuration**
- Strict mode with `exactOptionalPropertyTypes` and `verbatimModuleSyntax`
- Target: ESNext with Node.js modules
- Runs directly via tsx (no build output directory)
- Comprehensive type safety across all interfaces

**Variable Formats**
- `{{variable}}` - CLI template variables (processed by Handlebars)
- `${variable}` - Gradle build variables (preserved for post-creation configuration)
- Triple Handlebars `{{{variable}}}` - Used for publishing dependencies to prevent HTML escaping

**Multi-Loader Support**
- Supports Fabric, Forge, and NeoForge with complete feature parity
- Service loader pattern for platform abstraction
- Loader-specific entry points and configurations
- Conditional dependency injection per loader

**Maven Repository Strategy**
```gradle
repositories {
    // Development repositories for libraries
    exclusiveContent {
        forRepository {
            maven { name = 'Kaf Mod Resources'; url = 'https://raw.githubusercontent.com/iamkaf/modresources/main/maven/' }
        }
        filter { includeGroup 'com.iamkaf.amber' }
    }

    // Modrinth Maven for runtime mods
    exclusiveContent {
        forRepository {
            maven { name = 'Modrinth'; url = 'https://api.modrinth.com/maven' }
        }
        filter { includeGroup 'maven.modrinth' }
    }
}
```

**Build System Integration**
- Real Gradle execution with 10-minute timeout and output filtering
- Platform-specific wrapper handling (gradlew.bat vs ./gradlew)
- Permission management for Unix-like systems
- Comprehensive error handling with helpful error messages

## File Organization

```
src/
├── index.ts                 # Main entry point and interactive mode
├── cli.ts                   # CLI argument parsing
├── core.ts                  # Legacy pipeline functions
├── pipeline.ts              # Mode-agnostic pipeline functions
├── pipeline-runner.ts       # Pipeline execution engine
├── types.ts                 # TypeScript interfaces
├── echo-registry.ts         # External API integration
├── template-variables.ts    # 70+ variable generation system
├── config/                  # Configuration management
│   ├── index.ts             # Barrel exports
│   ├── dependencies.ts      # Three-tier dependency system
│   ├── utility-mods.ts      # Legacy compatibility layer
│   └── api-urls.ts          # Centralized URL management
├── headless-mode.ts         # CI/automation mode
├── config-mode.ts           # JSON configuration mode
├── config-loader.ts         # Configuration file handling
├── warnings.ts              # Validation and warning system
├── result-reporter.ts       # Structured output formatting
└── util.ts                  # Utility functions

templates/
├── base/                    # Core template files
│   ├── common/              # Shared code across loaders
│   ├── buildSrc/            # Gradle build logic
│   ├── gradle/              # Gradle wrapper
│   └── *.gradle, *.md       # Build files and documentation
├── loaders/                 # Loader-specific templates
│   ├── fabric/              # Fabric-specific code and config
│   ├── forge/               # Forge-specific code and config
│   └── neoforge/            # NeoForge-specific code and config
└── license/                 # License templates (mit.txt, lgpl.txt, arr.txt)
```

## Echo Registry API Integration

The CLI uses a sophisticated dual-API system with the Echo Registry:

### Versions API
- **Endpoint**: `/versions/dependencies/{minecraft_version}?projects={projects}`
- **Purpose**: Fetches latest version information for dependencies
- **Returns**: Maven coordinates, version numbers, download URLs
- **Used For**: Foundation dependencies and general version information

### Compatibility API
- **Endpoint**: `/projects/compatibility?projects={projects}&versions={minecraft_version}`
- **Purpose**: Determines loader-specific version availability
- **Returns**: Loader version matrix showing which versions are available for each loader
- **Used For**: Runtime mods that need loader-specific version handling

### API Response Structure

**Versions Response**:
```typescript
interface Dependency {
    name: string;
    loader: "fabric" | "neoforge" | "forge" | "universal";
    version: string;
    coordinates?: string;  // Maven coordinates for Modrinth integration
    // ... other fields
}
```

**Compatibility Response**:
```typescript
interface LoaderVersions {
    forge: string | null;
    neoforge: string | null;
    fabric: string | null;
}

interface CompatibilityResponse {
    data: Record<string, Record<string, LoaderVersions>>;
    success: boolean;
}
```

### Usage Pattern

```typescript
// 1. Get project names from selected mods
const requestedModProjects = mod.mods.map(modId => getDependencyConfig(modId)?.registryProjectName);

// 2. Fetch compatibility data for loader-specific versions
const compatibilityResponse = await fetchCompatibilityVersions(mod.minecraftVersion, requestedModProjects);

// 3. Extract loader versions for each mod
const jeiLoaderData = extractLoaderVersions(compatibilityResponse.data, 'jei', mod.minecraftVersion);
// Results: { fabric_version: "15.2.0", forge_version: "15.2.0", neoforge_version: "17.0.0" }

// 4. Apply to template variables
templateVariables.jei_version_fabric = jeiLoaderData.fabric_version || "NOT_AVAILABLE";
```

This dual-API approach enables:
- **Accurate Compatibility**: Only include mods that actually support the selected loaders
- **Loader-Specific Versions**: Different mod versions may be available for different loaders
- **Fallback Handling**: Graceful degradation when mods aren't available for certain loaders
- **Clean Generation**: Projects without selected mods get completely clean gradle.properties

## Dependency Configuration

### Current Dependencies

**Libraries (Development Dependencies)**
- **Amber**: Modding utilities and common code (Kaf Mod Resources repository)
- **Fabric Loom**: Fabric modding build tool (auto-fetched from Echo Registry)
- **ModDevGradle**: NeoForge modding build tool plugin

**Runtime Mods (Optional Utilities)**
- **JEI**: Just Enough Items recipe viewer
- **Jade**: Block and entity information overlay
- **Sodium**: Performance optimization mod (Fabric/NeoForge only)
- **Mod Menu**: In-game mod configuration menu (Fabric only)
- **REI**: Roughly Enough Items recipe viewer

### Maven Coordinate Processing

The CLI automatically handles Maven coordinate extraction and loader suffix management:

```javascript
// Input from Echo Registry: "maven.modrinth:sodium:mc1.21.10-0.7.3-neoforge"
// Extract clean version: "mc1.21.10-0.7.3"
// Apply loader suffix in template: "${sodium_version}-fabric"
// Result: "maven.modrinth:sodium:mc1.21.10-0.7.3-fabric"
```

### buildSrc Dynamic Processing

The buildSrc system dynamically processes only the properties that exist in the project:

```groovy
// multiloader-common.gradle
project.properties.findAll { key, value ->
    key.matches('.*_version$') &&
    (key.contains('_version_fabric') || key.contains('_version_forge') || key.contains('_version_neoforge') ||
     key in ['amber_version'])
}.each { propName, propValue ->
    expandProps[propName] = propValue
}
```

## CLI Usage Examples

### Interactive Mode (Default)
```bash
npx create-minecraft-mod ./my-mod
# Follow prompts for complete configuration
```

### Headless Mode (CI/CD)
```bash
npx create-minecraft-mod ./my-mod --ci-mode \
  --name "My Mod" \
  --author "Your Name" \
  --loaders "fabric,forge" \
  --mods "jei,jade" \
  --output-format json
```

### Config Mode (Team Workflows)
```bash
npx create-minecraft-mod ./my-mod --config ./team-config.json
```

## Current Implementation Status

**Core System**: 100% complete
- Template processing with 43/43 files using Handlebars variables
- Multi-loader support (Fabric, Forge, NeoForge) with complete feature parity
- Real Gradle integration with 10-minute build execution and output filtering
- Three-tier dependency architecture with Modrinth Maven integration
- Echo Registry API integration (dual version/compatibility system)
- Package structure transformation and class renaming
- Service registration generation
- IDE integration (VS Code, IntelliJ) with background execution
- Git repository initialization with automatic user configuration

**Advanced Features**:
- License template processing with Handlebars integration
- Structured result reporting for CI/CD integration
- Comprehensive validation and warning system
- Loader-specific version management via Compatibility API

**Remaining Work**:
- Advanced sample code injection system (anchor-based with metadata)
- Enhanced license generation using SPDX packages

## Important Development Notes

- **Gradle Variable Preservation**: The `${variable}` patterns are for Gradle build configuration, NOT CLI processing. Never modify these in Handlebars processing.
- **Mod Metadata Files**: MUST use `${variable}` format to reference gradle.properties values for proper Minecraft mod loading.
- **Echo Registry Integration**: Dual-API system provides both version information and compatibility data.
- **Repository Strategy**: Libraries use development repositories, Runtime Mods use Modrinth Maven with exclusiveContent.
- **Dependency Conditionalization**: Clean build.gradle generation with dynamic property detection.
- **Compatibility API Usage**: Essential for multi-loader support - determines which mods are available for which loaders.

## External Dependencies and APIs

### Echo Registry API
- **Base URL**: `https://echo.iamkaf.com/api`
- **Versions Endpoint**: `/versions/dependencies/{minecraft_version}?projects={projects}`
- **Compatibility Endpoint**: `/projects/compatibility?projects={projects}&versions={minecraft_version}`
- **Provides**: Real-time version information and loader compatibility for 15+ Minecraft modding dependencies
- **Features**: Maven coordinate extraction, loader-specific versions, compatibility matrix

### Maven Repositories
- **Kaf Mod Resources**: `https://raw.githubusercontent.com/iamkaf/modresources/main/maven/`
- **Modrinth Maven**: `https://api.modrinth.com/maven` (with exclusiveContent filtering)
- **Fabric Maven**: `https://maven.fabricmc.net/`
- **Forge Maven**: `https://maven.minecraftforge.net/`
- **NeoForge Maven**: `https://maven.neoforged.net/releases`

### Development Tools
- **@clack/prompts**: Interactive CLI interface with spinners and validation
- **handlebars**: Template variable substitution engine
- **execa**: Process execution for Gradle and Git operations
- **tsx**: TypeScript execution engine (no build step required)