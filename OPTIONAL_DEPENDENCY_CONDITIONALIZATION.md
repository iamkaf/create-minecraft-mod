# Optional Dependency Conditionalization System

## Overview

The optional dependency conditionalization system ensures that when users generate projects with NO optional dependencies selected, the generated projects are completely clean with no traces of unselected dependencies. This system handles both libraries (like Amber) and runtime utility mods (like JEI, Jade, Sodium, etc.).

## Architecture

### 1. Dynamic Property Detection (buildSrc)

**File**: `templates/base/buildSrc/src/main/groovy/multiloader-common.gradle`

The buildSrc system uses dynamic property detection instead of hardcoded dependency lists:

```groovy
// Handle optional library and utility mod versions dynamically
// Only process properties that actually exist in the project
project.properties.findAll { key, value ->
    // Include optional dependency version properties that exist
    key.matches('.*_version$') &&
    (key.contains('_version_fabric') || key.contains('_version_forge') || key.contains('_version_neoforge') ||
     key in ['amber_version'])
}.each { propName, propValue ->
    expandProps[propName] = propValue
}
```

**Key Features:**
- Only processes properties that actually exist in the project
- No special casing for individual dependencies
- Handles loader-specific versions (`_version_fabric`, `_version_forge`, `_version_neoforge`)
- Includes legacy library versions (`amber_version`)

### 2. Clean Template Variables

**File**: `src/template-variables.ts`

The template variables system only generates variables for selected dependencies:

```typescript
// Get project names for requested mods only
const requestedModProjects = mod.mods
    .map(modId => getDependencyConfig(modId)?.registryProjectName)
    .filter((name): name is string => name !== undefined);

// Extract loader-specific versions for requested mods only
const getLoaderVersions = (modId: string, registryProjectName: string) => {
    if (!mod.mods.includes(modId)) return {};
    return extractLoaderVersions(compatibilityData, registryProjectName, mod.minecraftVersion);
};
```

**Key Features:**
- Only fetches compatibility data for selected mods
- Returns empty objects for unselected dependencies
- Uses Echo Registry API for loader-specific versions

### 3. Clean Template System

**Files**:
- `templates/base/gradle.properties`
- `templates/loaders/fabric/build.gradle`
- `templates/loaders/forge/build.gradle`
- `templates/loaders/neoforge/build.gradle`

#### gradle.properties
Uses Handlebars conditionals to only include properties for selected dependencies:

```properties
{{#if amber_version}}
# Amber - Single version (from its own repository, not Modrinth)
amber_version={{amber_version}}
{{/if}}

{{#if jei_version_fabric}}
# JEI - Different versions per loader
jei_version_fabric={{jei_version_fabric}}
jei_version_forge={{jei_version_forge}}
jei_version_neoforge={{jei_version_neoforge}}
{{/if}}
```

#### build.gradle files
All loaders use conditional dependency inclusion:

```gradle
// Library dependencies (become required when selected)
if (project.hasProperty('amber_version') && amber_version != "NOT_AVAILABLE") {
    modImplementation "com.iamkaf.amber:amber-fabric:${amber_version}"
}

// Runtime mods (optional, removable)
if (project.hasProperty('jei_version_fabric') && jei_version_fabric != "NOT_AVAILABLE") {
    modRuntimeOnly "maven.modrinth:jei:${jei_version_fabric}"
}
```

## Behavior

### When No Dependencies Selected

Generated `gradle.properties`:
```properties
# Optional Libraries
# (empty - no dependencies selected)
```

Generated dependencies:
- `mod_modrinth_depends=""`
- `mod_curse_depends=""`

### When Dependencies Selected

Generated `gradle.properties`:
```properties
# Optional Libraries
# Amber - Single version (from its own repository, not Modrinth)
amber_version=8.1.0+1.21.10

# JEI - Different versions per loader
jei_version_fabric=26.2.0.27
jei_version_forge=NOT_AVAILABLE
jei_version_neoforge=26.2.0.27
```

Generated dependencies:
- `mod_modrinth_depends=amber`
- `mod_curse_depends=amber-lib`

## Compatibility API Integration

The system integrates with the Echo Registry compatibility API to provide loader-specific versions:

- **JEI**: Different versions per loader (Forge support dropped after 1.21)
- **Jade**: Different versions per loader (Forge support dropped after 1.21)
- **Sodium**: Different versions per loader (NeoForge support varies)
- **REI**: Different versions per loader
- **Mod Menu**: Different versions per loader (NeoForge support varies)

When a mod doesn't support a specific loader, the version is set to `NOT_AVAILABLE`.

## Publishing Dependencies

The system generates clean publishing dependencies:

### Empty Dependencies
```properties
mod_modrinth_depends=""
mod_curse_depends=""
```

### With Libraries
```properties
mod_modrinth_depends=amber
mod_curse_depends=amber-lib
```

Note: Uses triple Handlebars (`{{{variable}}}`) in templates to avoid HTML escaping.

## Future-Proofing

The system is designed to handle future dependencies automatically:

1. **New Libraries**: Add to `dependencies.ts` with `defaultSelection: false`
2. **New Runtime Mods**: Add to `dependencies.ts` with compatibility API support
3. **Template Logic**: No changes needed - dynamic detection handles new properties
4. **buildSrc**: No hardcoded lists - automatically processes new `_version` properties

## Testing

The system has been verified with these scenarios:

1. ✅ **Zero Dependencies**: Clean project with no optional dependency traces
2. ✅ **All Dependencies**: All optional mods included with correct loader-specific versions
3. ✅ **Mixed Combinations**: Various combinations work correctly
4. ✅ **Build Verification**: All loaders (Fabric, Forge, NeoForge) build successfully
5. ✅ **Clean Generation**: Projects with no selection have empty strings for publishing dependencies

## Technical Implementation Details

### Property Naming Convention

- **Libraries**: `<library>_version` (e.g., `amber_version`)
- **Runtime Mods**: `<mod>_version_<loader>` (e.g., `jei_version_fabric`)
- **Legacy Support**: Some properties use legacy single version format

### Conditional Logic Pattern

All conditional logic follows this pattern:
```groovy
if (project.hasProperty('property_name') && property_name != "NOT_AVAILABLE") {
    // Include dependency
}
```

This ensures both:
1. Property exists (was selected by user)
2. Property is not "NOT_AVAILABLE" (supports current loader)

### Error Prevention

The dynamic property detection prevents build errors by:
- Only processing properties that exist
- Avoiding missing property errors in template expansion
- Gracefully handling unsupported loader combinations

## Conclusion

This conditionalization system ensures that optional dependencies are truly optional throughout the entire system, from user selection to final generated project, while maintaining clean builds for all dependency combinations.