# Comprehensive Template Variables Analysis Report

This report thoroughly analyzes all template files in the `templates/` directory to identify every variable needed for the Minecraft mod creation CLI tool, considering real-world usage and potential improvements.

## Overview

The template system uses multiple variable formats with different purposes:
- **`${variable_name}`** - Used by Gradle's `expand()` mechanism for post-creation configuration. **DO NOT TOUCH THESE** - they're essential for the build system.
- **`{{ variable_name }}`** - Custom format added for this CLI project's template processing.
- **Hardcoded values** - Many values are currently hardcoded and should be converted to variables for this project.

**Important**: The `${variable}` format must be preserved as-is since it allows users to configure their mod after creation through gradle.properties. Our CLI should only process the `{{variable}}` format and generate appropriate hardcoded values.

## Complete Variable Inventory

### Core Project Identity Variables
- **`mod_name`** - The display name of the mod (e.g., "Example Mod")
- **`mod_id`** - The technical identifier for the mod (e.g., "examplemod")
- **`mod_author`** - The author's name (e.g., "yourname")
- **`description`** - Short description of the mod (e.g., "A template mod built from a multi-loader setup.")
- **`group`** - Maven group identifier (e.g., "com.example.modtemplate")
- **`version`** - Mod version (e.g., "1.0.0+1.21.5")
- **`license`** - License identifier (e.g., "MIT")
- **`credits`** - Credits/acknowledgments (can be empty)

### Build Tool Version Variables
- **`gradle_version`** - Gradle wrapper version (currently hardcoded as "8.14" in gradle-wrapper.properties)
- **`fabric_loom_version`** - Fabric Loom plugin version (currently "1.11-SNAPSHOT")
- **`moddevgradle_version`** - NeoForge ModDevGradle version (currently "2.0.97")
- **`modpublisher_version`** - ModPublisher plugin version (currently "2.1.6")
- **`forgegradle_version`** - ForgeGradle version (currently "[6.0.24,6.2)")
- **`mixin_version`** - Mixin annotation processor version (currently "0.7-SNAPSHOT")
- **`toolchains_resolver_version`** - Foojay toolchains resolver version (currently "0.8.0")

### Java/Minecraft Configuration
- **`java_version`** - Java version target (currently 21)
- **`java_compatibility_level`** - Mixin compatibility level (currently hardcoded as "JAVA_21" but one file has "JAVA_18")
- **`minecraft_version`** - Target Minecraft version (e.g., "1.21.5")
- **`minecraft_version_range`** - Compatible MC version range (e.g., "[1.21.5, 1.22)")
- **`fabric_version_range`** - Fabric version compatibility (e.g., ">=1.21.5")

### Development Tool Versions
- **`fabric_version`** - Fabric API version (e.g., "0.119.5+1.21.5")
- **`fabric_loader_version`** - Fabric Loader version (e.g., "0.16.10")
- **`forge_version`** - Forge version (e.g., "55.0.1")
- **`forge_loader_version_range`** - Forge loader compatibility (e.g., "[55,)")
- **`neoforge_version`** - NeoForge version (e.g., "21.5.4-beta")
- **`neoforge_loader_version_range`** - NeoForge loader compatibility (e.g., "[4,)")
- **`neo_form_version`** - NeoForm mapping version (e.g., "1.21.5-20250325.162830")
- **`parchment_minecraft`** - Parchment mappings MC version (e.g., "1.21.5")
- **`parchment_version`** - Parchment mappings version (e.g., "2025.04.19")
- **`mod_menu_version`** - ModMenu version (e.g., "14.0.0-rc.2")
- **`amber_version`** - Amber library version (optional, commented by default)

### Publishing/Release Variables
- **`curse_id`** - CurseForge project ID (e.g., "1275720")
- **`modrinth_id`** - Modrinth project ID (e.g., "yiKUfwkf")
- **`release_type`** - Release type (e.g., "release")
- **`game_versions`** - Supported game versions (e.g., "1.21.5")
- **`mod_environment`** - Mod environment (e.g., "server")
- **`dry_run`** - Publishing debug flag (boolean)
- **`mod_modrinth_depends`** - Modrinth dependencies (e.g., "amber")
- **`mod_curse_depends`** - CurseForge dependencies (e.g., "amber-lib")

### Java Package Structure Variables
- **`package_base`** - Java package base (inferred from group, e.g., "com.example.modtemplate")
- **`package_path`** - File system path for package (e.g., "com/example/modtemplate")
- **`main_class_name`** - Main mod class name (currently "TemplateMod")
- **`fabric_entry_class`** - Fabric entry point class name (currently "TemplateFabric")
- **`forge_entry_class`** - Forge entry point class name (currently "TemplateForge")
- **`neoforge_entry_class`** - NeoForge entry point class name (currently "TemplateNeoForge")
- **`constants_class_name`** - Constants class name (currently "Constants")
- **`datagen_class_name`** - Datagen entry point class name (currently "TemplateDatagen")

### Folder Structure Variables
- **`source_folder_renames`** - Template uses `src/main/java/com/example/modtemplate/` which must be renamed to match user's package structure
- **`package_folder_mapping`** - Need to rename all `com/example/modtemplate/` folders to match user's package path
- **`loader_package_structure`** - Each loader's source folders need package path updates

### Content Creation Variables (For Future Templates)
- **`first_block_name`** - Name of first custom block (e.g., "example_block")
- **`first_item_name`** - Name of first custom item (e.g., "example_item")
- **`tab_group_name`** - Creative tab group identifier
- **`tab_display_name`** - Creative tab display name

### Service Interface Variables
- **`platform_helper_interface`** - Platform helper interface name (currently "IPlatformHelper")
- **`fabric_platform_helper`** - Fabric platform helper implementation name (currently "FabricPlatformHelper")
- **`forge_platform_helper`** - Forge platform helper implementation name (currently "ForgePlatformHelper")
- **`neoforge_platform_helper`** - NeoForge platform helper implementation name (currently "NeoForgePlatformHelper")

### DataGen Provider Variables
- **`block_tag_provider_class`** - Block tag provider class name
- **`item_tag_provider_class`** - Item tag provider class name
- **`block_loot_provider_class`** - Block loot table provider class name
- **`model_provider_class`** - Model provider class name
- **`recipe_provider_class`** - Recipe provider class name

### Configuration File Variables
- **`mixin_min_version`** - Minimum Mixin version (currently "0.8")
- **`mixin_package`** - Mixin package path (currently "com.example.modtemplate.mixin")
- **`pack_format_version`** - Resource pack format (currently "8")
- **`mixin_refmap_name`** - Mixin refmap filename (currently "${mod_id}.refmap.json")

### Repository and URL Variables
- **`github_url`** - GitHub repository URL (currently hardcoded placeholder)
- **`issue_tracker_url`** - Issue tracker URL (currently placeholder)
- **`update_json_url`** - Update JSON URL (currently placeholder)
- **`homepage_url`** - Mod homepage URL (currently placeholder)

## Variable Distribution Analysis

### Build Configuration Files

#### `gradle.properties` (55 variables)
Contains the most comprehensive variable set, serves as the primary configuration file.

#### `build.gradle` (root)
- **Fixed versions**: fabric-loom, moddevgradle, modpublisher
- **Uses**: `${mod_name}` in changelog extraction function
- **Missing**: Should use variables for all plugin versions

#### `gradle-wrapper.properties`
- **Hardcoded**: Gradle version "8.14"
- **Should be**: `${gradle_version}`

#### `settings.gradle`
- **Uses**: `${mod_name}` for rootProject.name
- **Missing**: Toolchains resolver version should be variable

### Java Code Analysis

#### Common Module (`common/`)
- **Constants.java**: Hardcoded `MOD_ID = "examplemod"` and `MOD_NAME = "Example Mod"`
- **TemplateMod.java**: Uses Constants, no direct variables
- **Services.java**: Uses service loading pattern, no variables
- **Issue**: All class names are hardcoded and should be configurable

#### Loader-Specific Modules
Each loader has an entry point class that:
- References the main `TemplateMod` class
- Implements loader-specific interfaces
- Uses hardcoded class names

#### DataGen Classes
- All provider classes use hardcoded names with "Mod" prefix
- Class names should be configurable based on mod name

### Configuration Files

#### Mixin JSON Files
- **Inconsistent**: One file uses "JAVA_18" while others use "JAVA_21"
- **Package**: Hardcoded package path needs to be configurable
- **Refmap**: Uses `${mod_id}` correctly

#### Fabric `fabric.mod.json`
- **Entry points**: Hardcoded class names need variables
- **Mixins**: Uses `${mod_id}` correctly
- **Authors**: Single author, should support multiple

#### Forge/NeoForge TOML Files
- **Dependencies**: Uses all variables correctly
- **Features**: Commented sections with placeholders
- **Authors**: Single author field

### Service Registration Files
- **META-INF/services/**: Hardcoded fully qualified class names
- **Must be**: Dynamically generated based on package and class name variables

## Critical Template Issues Found

### 1. **Folder Structure Renaming Required**
**CRITICAL**: The template uses hardcoded folder structure:
```
src/main/java/com/example/modtemplate/
```
This entire folder path must be dynamically renamed to match the user's package name. For example, if user provides package `com.mycompany.coolmod`, the folder structure must become:
```
src/main/java/com/mycompany/coolmod/
```

This affects ALL modules: common/, fabric/, forge/, neoforge/

### 2. **Package Declarations vs Folder Structure**
Every Java file has `package com.example.modtemplate;` at the top, which must be updated to match the user's package AND the new folder structure.

### 3. **Class Name Consistency**
While `${variable}` Gradle variables handle most configuration, class names themselves are hardcoded in:
- Java file names (TemplateMod.java, Constants.java, etc.)
- Class declarations within files
- Service registration files
- fabric.mod.json entry points

These need to be generated based on user input.

### 4. **Inconsistent Java Compatibility Level**
```java
// Most files have "JAVA_21" but one has "JAVA_18"
"compatibilityLevel": "JAVA_18"  // Should be JAVA_${java_version}
```

### 5. **Service Registration Files**
META-INF/services files contain hardcoded fully qualified class names that must match the new package structure and class names.

### 6. **Import Statements**
All Java files contain imports like `import com.example.modtemplate.Constants;` which must be updated to match the new package structure.

## Variable Sources and Data Flow

### User Input (via CLI prompts)
- `mod_name` → `mod_id` (generated), `package_base` (generated)
- `mod_author` → author fields
- `description` → description fields
- `package` → `group`, `package_base`, `package_path`
- `license` → license fields
- **Missing prompts**: mod version, java version, minecraft version

### Generated/Derived Variables
```typescript
// Derivation logic needed
mod_id = generateModId(mod_name) // Lowercase, alphanum + underscores
group = package // Direct mapping
package_base = package // Direct mapping
package_path = package.replace(/\./g, '/') // File path format
main_class_name = toPascalCase(mod_name) + "Mod"
constants_class_name = toPascalCase(mod_name) + "Constants"
```

### API-Fetched Variables (via Echo Registry)
The existing `fetchDependencyVersions()` function can provide:
- `minecraft_version` (and calculated range)
- `fabric_version` and `fabric_loader_version`
- `forge_version` and related ranges
- `neoforge_version` and related ranges
- `neo_form_version`
- `parchment_minecraft` and `parchment_version`
- `mod_menu_version`
- `amber_version` (optional)
- **Missing**: Build tool versions, Gradle versions

### Default/Calculated Values
- `gradle_version` - Should be fetched or have sensible default
- `java_compatibility_level` - `JAVA_${java_version}`
- `minecraft_version_range` - Calculate from MC version
- `fabric_version_range` - Calculate from MC version
- `pack_format_version` - Depends on MC version

## Template Improvement Recommendations

### 1. **Standardize All Versions**
Move ALL version variables to `gradle.properties` and reference them everywhere.

### 2. **Make All Java Code Configurable**
- Package names should use variables
- Class names should be configurable
- Service files should be generated

### 3. **Add Missing User Prompts**
- Mod version (with default "1.0.0")
- Java version (default 21)
- Minecraft version (fetch from Echo Registry)
- Include sample content option (blocks, items, etc.)

### 4. **Improve Variable Consistency**
- Use `${variable}` format everywhere
- Add template validation
- Create variable dependency mapping

### 5. **Dynamic File and Folder Generation**
**CRITICAL**: Some operations must be performed during template processing:

**Folder Renaming:**
- Rename entire folder trees: `src/main/java/com/example/modtemplate/` → `src/main/java/{{package_path}}/`
- This affects ALL modules (common/, fabric/, forge/, neoforge/)

**File Generation (not just copying):**
- Service registration files (META-INF/services/*)
- Files with hardcoded class names that must be generated
- Package declarations must be updated in all Java files
- Import statements must be updated to match new package structure

**File Processing:**
- Java files need package declaration updates
- Import statements need updating
- Class names within files need to match generated file names

### 6. **Add Content Templates**
Create templates for common mod components:
- Custom blocks
- Custom items
- Commands
- Events
- Config systems

## Implementation Priority

### Phase 1: Critical Folder Structure (High Priority)
1. **Implement folder renaming logic** for package structure transformation
2. **Create package declaration updates** in all Java files
3. **Update import statements** to match new package structure
4. **Generate service registration files** with correct package paths

### Phase 2: Code Generation
1. Make Java class names configurable
2. Generate file names based on user input
3. Update fabric.mod.json entry points dynamically
4. Handle class name references in configuration files

### Phase 3: Template Processing
1. Implement `{{variable}}` substitution (preserving `${variable}` for Gradle)
2. Add mod version prompt
3. Fix hardcoded build tool versions where appropriate
4. Standardize Java compatibility level

### Phase 4: Content Templates (Future)
1. Sample block/item templates
2. Command/event templates
3. Configuration systems
4. DataGen templates

### Phase 5: Advanced Features (Future)
1. Multi-module projects
2. Optional feature templates
3. Custom build configurations
4. Testing framework templates

This comprehensive analysis provides the foundation for creating a truly flexible and powerful mod generation system.