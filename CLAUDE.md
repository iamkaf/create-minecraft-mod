# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
npm run run  # Executes via tsx: npx tsx ./src/index.ts
```

### Testing
Currently no test framework is set up. Tests are run manually by executing the CLI with various inputs.

## Architecture Overview

This is a Node.js CLI tool that generates Minecraft mod projects from templates. The architecture follows a modular pipeline pattern:

### Core Components

**Entry Point (`src/index.ts`)**
- Handles CLI argument parsing and help display
- Orchestrates the user prompt sequence using @clack/prompts
- Creates the Mod configuration object and passes it to the pipeline

**CLI Module (`src/cli.ts`)**
- Minimal argument parsing without external dependencies
- Supports positional destination path argument and help flags
- Provides interactive fallback when no destination path is provided

**Core Pipeline (`src/core.ts`)**
- Contains the main `runPipeline()` function that orchestrates all project generation steps
- Implements real file operations (copying, transforming, variable substitution)
- Key functions: `cloneTemplate()`, `transformPackageStructure()`, `applyTemplateVariables()`, `renameClassFiles()`

**Template System**
- Templates stored in `templates/` directory with structure: `base/`, `loaders/`, `license/`, `samples/`, `workflows/`, `meta/`
- Uses Handlebars for variable substitution with `{{variable}}` format
- Preserves Gradle's `${variable}` format for build configuration
- Supports dynamic package structure transformation (`com/example/modtemplate/` → user package)

**Template Variables (`src/template-variables.ts`)**
- Comprehensive interface with 70+ variables for all aspects of mod configuration
- Integrates with Echo Registry API to fetch latest addon versions
- Handles version management for all supported libraries and utilities

**Echo Registry Integration (`src/echo-registry.ts`)**
- Fetches latest versions of Minecraft modding addons from official Echo Registry API
- Supports major addons: JEI, Jade, Cloth Config, Architectury API, etc.

### Template Processing Pipeline

The pipeline executes these steps in order:
1. Clone template files from `templates/base/` and selected `templates/loaders/{loader}/`
2. Transform package structure from `com/example/modtemplate/` to user's package
3. Rename class files (TemplateMod → UserMod, etc.) and update references
4. Update Java package declarations and imports throughout all files
5. Generate service registration files for selected loaders
6. Apply Handlebars variable substitution to all template files
7. Configure loaders, install libraries and utilities (placeholder implementations)
8. Add sample code, apply license, finalize project (placeholder implementations)

### Key Technical Details

**TypeScript Configuration**
- Uses strict mode with `exactOptionalPropertyTypes` and `verbatimModuleSyntax`
- Target: ESNext with Node.js modules
- No build output directory - runs directly via tsx

**Variable Formats**
- `{{variable}}` - CLI template variables (processed by Handlebars)
- `${variable}` - Gradle build variables (preserved for post-creation configuration)

**Multi-Loader Support**
- Supports Fabric, Forge, and NeoForge loaders
- Each loader contributes specific files while sharing common code
- Service loader pattern for platform abstraction

## File Organization

- `src/` - TypeScript source code
- `templates/` - Mod template files organized by type
- `TODO.md` - Current implementation status and remaining tasks
- `TEMPLATE_HANDLEBARS_CHECKLIST.md` - Master checklist for tracking which template files have been updated with handlebars variables

## Current Implementation Status

The core template processing system is implemented and tested. Remaining work includes:
- Implementing real library/utility/sample installation functions (currently placeholders)
- Adding `{{variable}}` substitution to 28 template files (tracked in checklist)
- Implementing post-creation actions (git init, gradle build, IDE integration)

## Important Notes

- The `${variable}` variables are for Gradle, not CLI. Do NOT touch them, ever.
- **Mod metadata files MUST use `${variable}` format to reference gradle.properties values.**