# TODO List - Minecraft Mod Creator CLI

## Overview
This TODO list covers the implementation of the template processing system for the create-minecraft-mod CLI tool, based on the current state where CLI prompts are complete but template processing is simulated.

## Current State
- ✅ CLI argument parsing and destination path handling
- ✅ Complete user input collection (all prompts implemented)
- ✅ Pipeline structure with 12 functions
- ❌ Template processing (currently only simulated with delays)
- ❌ Actual file operations and variable substitution
- ❌ Folder structure transformation

## Phase 1: Critical Template Processing Foundation (HIGH PRIORITY)

### 1.1 Template Cloning Implementation
- [ ] **Replace `cloneTemplate()` simulation** with actual file copying from `templates/` directory
- [ ] Copy entire template structure to destination path
- [ ] Ensure proper directory permissions and structure preservation
- [ ] Handle file existence conflicts gracefully

### 1.2 Folder Structure Transformation (CRITICAL)
- [ ] **Implement package folder renaming**: `src/main/java/com/example/modtemplate/` → `src/main/java/{{package_path}}/`
- [ ] Apply folder renaming to ALL modules: `common/`, `fabric/`, `forge/`, `neoforge/`
- [ ] Update folder structure for nested package levels (e.g., `com.mycompany.coolmod` → `com/mycompany/coolmod`)
- [ ] Validate that Java package structure matches folder paths

### 1.3 Java Source Code Processing
- [ ] **Update package declarations** in all Java files to match user's package
- [ ] **Update import statements** to reference new package structure
- [ ] **Generate class names** based on mod name (currently hardcoded "TemplateMod", "Constants", etc.)
- [ ] Update class references in service registration files
- [ ] Handle fully qualified class names in configuration files

### 1.4 Service Registration Files
- [ ] **Generate META-INF/services files** dynamically with correct package paths
- [ ] Update service files for all platform helpers (Fabric, Forge, NeoForge)
- [ ] Ensure service interface names match generated class names

## Phase 2: Variable Substitution System

### 2.1 Template Variable Processor
- [ ] **Use handlebars for `{{variable}}` substitution** while preserving `${variable}` for Gradle
- [ ] Create variable mapping from Mod interface to template variables
- [ ] Handle both file content and file name substitutions using handlebars
- [ ] Add validation for missing required variables

### 2.2 Build Configuration Processing
- [ ] **Process gradle.properties** with all 55+ variables from the analysis
- [ ] Update build.gradle files with mod-specific configurations
- [ ] Configure loader-specific build files (fabric.gradle, forge.gradle, neoforge.gradle)
- [ ] Set up version variables and dependency management

### 2.3 Configuration File Updates
- [ ] **Update fabric.mod.json** with dynamic entry points and metadata
- [ ] **Update Forge/NeoForge TOML files** with mod information
- [ ] **Update Mixin JSON files** with correct package paths and compatibility levels
- [ ] Fix Java compatibility level inconsistency (JAVA_18 vs JAVA_21)

## Phase 3: Loader and Library Integration

### 3.1 Multi-Loader Configuration
- [ ] **Enhance `configureLoaders()`** to set up build files for selected loaders
- [ ] Conditionally include loader-specific modules based on user selection
- [ ] Configure loader dependencies and version ranges
- [ ] Set up loader-specific entry points

### 3.2 Library and Utility Integration
- [ ] **Implement `installLibraries()`** to add Amber, Cloth Config, Architectury
- [ ] **Implement `installUtilityMods()`** to add ModMenu, JEI, Jade
- [ ] Update build configurations with selected dependencies
- [ ] Handle version compatibility and conflicts

### 3.3 API Version Fetching
- [ ] **Integrate Echo Registry API** for latest versions
- [ ] Fetch Minecraft, Fabric, Forge, NeoForge versions dynamically
- [ ] Calculate version ranges and compatibility
- [ **Update gradle.properties** with fetched versions

## Phase 4: Sample Code Implementation

### 4.1 Sample Code Templates
- [ ] **Implement `addSampleCode()`** with actual code generation
- [ ] Create item registration template
- [ ] Create datagen template
- [ ] Create commands template
- [ ] Create mixin example template

### 4.2 Dynamic Class Generation
- [ ] Generate class names based on user's mod name
- [ ] Create file names and class declarations consistently
- [ ] Update all references to generated classes
- [ ] Handle package imports for generated code

## Phase 5: Post-Creation Actions

### 5.1 Build System Integration
- [ ] **Implement real `runGradle()`** function (not just delay)
- [ ] Execute actual Gradle commands in destination directory
- [ ] Handle build errors and provide meaningful feedback
- [ ] Support different Gradle tasks (build, buildSrc, etc.)

### 5.2 Development Environment Setup
- [ ] **Implement `initializeGit()`** with actual git commands
- [ ] **Implement `openInVSCode()`** and `openInIntelliJ()`** with IDE detection
- [ ] Set up proper .gitignore and project configuration
- [ ] Handle cases where IDEs are not installed

### 5.3 License Application
- [ ] **Implement `applyLicense()`** with actual license file copying
- [ ] Update license headers in source files
- [ ] Configure license in build files
- [ ] Handle different license types (MIT, LGPL, ARR)

## Phase 6: Template File Updates

### 6.1 Template Variable Conversion
- [ ] **Convert hardcoded values** to `{{variable}}` format in template files
- [ ] Update template files to use consistent variable naming
- [ ] Add missing variables for all user inputs
- [ ] Ensure all 70+ identified variables are available

### 6.2 Template Structure Improvements
- [ ] **Standardize build tool versions** across all templates
- [ ] Fix Java compatibility level inconsistencies
- [ **Update placeholder URLs** and repository information
- [ ] Improve template documentation and comments

## Phase 7: Enhanced Features (Future)

### 7.1 Content Templates
- [ ] Create templates for custom blocks and items
- [ ] Add command and event handling templates
- [ ] Create configuration system templates
- [ ] Add testing framework templates

### 7.2 Advanced Customization
- [ ] Support for custom build configurations
- [ ] Multi-module project templates
- [ ] Optional feature templates
- [ ] Template validation and error reporting

## Technical Implementation Notes

### Critical Dependencies
- **Node.js fs/promises** for file operations
- **Node.js path** for path manipulation
- **handlebars** (already in package.json) for template variable substitution
- **Gradle variable regex**: `\$\{([^}]+)\}` to preserve for Gradle

### File Processing Strategy
1. **Copy template structure** to destination
2. **Rename package folders** to match user input
3. **Process all files** with handlebars for template variable substitution
4. **Generate dynamic files** (service registrations)
5. **Update configuration files** with loader-specific settings

### Error Handling Requirements
- Validate destination path permissions
- Handle file copy conflicts
- Provide meaningful error messages for template processing failures
- Support cleanup on partial failures

## Estimated Implementation Order
1. **Template cloning and folder transformation** (Phase 1)
2. **Basic variable substitution** (Phase 2.1)
3. **Build configuration updates** (Phase 2.2)
4. **Loader configuration** (Phase 3.1)
5. **Sample code generation** (Phase 4)
6. **Post-creation actions** (Phase 5)
7. **Advanced features** (Phase 6-7)

This implementation will transform the current simulation-based pipeline into a fully functional Minecraft mod generation system.