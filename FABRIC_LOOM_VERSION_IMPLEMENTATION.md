# Fabric Loom Version Selection Implementation

## Overview
This document describes the complete implementation of Fabric Loom version selection functionality for the create-minecraft-mod CLI tool. This feature allows users to select different Fabric Loom versions to resolve compatibility issues.

## Problem Solved
**Original Issue**: "Mod was built with a newer version of Loom (1.13.1), you are using Loom (1.11.8)"

**Solution**: Added interactive prompt, CLI argument, and configuration file support for Fabric Loom version selection.

## Implementation Details

### 1. CLI Argument Support (`src/cli.ts`)

#### Added to `CliArgs` interface:
```typescript
export interface CliArgs {
  // ... existing properties
  fabricLoomVersion?: string;
}
```

#### Added argument parsing:
```typescript
case "--fabric-loom-version":
  if (nextArg && !nextArg.startsWith("-")) {
    result.fabricLoomVersion = nextArg;
    i++; // Skip next argument
  }
  break;
```

#### Added help text:
```bash
--fabric-loom-version <version> Fabric Loom version (1.10,1.11,1.12,1.13)
```

### 2. Type Definitions (`src/types.ts`)

#### Added to `Mod` interface:
```typescript
export interface Mod {
  // ... existing properties
  fabricLoomVersion?: string;
}
```

### 3. Interactive Prompt (`src/index.ts`)

#### Added after loaders selection:
```typescript
// ─── FABRIC LOOM VERSION ────────────────────────────────────────
//
if (mod.loaders.includes('fabric')) {
  const fabricLoomVersion = await select({
    message: "Fabric Loom Version",
    options: [
      { value: "1.10", label: "1.10-SNAPSHOT (Stable)" },
      { value: "1.11", label: "1.11-SNAPSHOT (Current Default)" },
      { value: "1.12", label: "1.12-SNAPSHOT" },
      { value: "1.13", label: "1.13-SNAPSHOT (Latest)" }
    ],
    initialValue: "1.11"
  });

  if (isCancel(fabricLoomVersion)) {
    cancel("Operation cancelled.");
    process.exit(0);
  }

  mod.fabricLoomVersion = `${String(fabricLoomVersion)}-SNAPSHOT`;
}
```

**Features**:
- Only shows when Fabric loader is selected
- Provides clear labels for each version
- Defaults to 1.11 (current behavior)
- Automatically appends "-SNAPSHOT" suffix

### 4. Configuration File Support (`src/config-loader.ts`)

#### Added to `ModConfigFile` interface:
```typescript
export interface ModConfigFile {
  mod: {
    name: string;
    author: string;
    id: string;
    // ... existing properties
    fabricLoomVersion?: string;
  };
  // ... rest of interface
}
```

#### Added to `configToMod` function:
```typescript
return {
  // ... existing properties
  destinationPath,
  fabricLoomVersion: config.mod.fabricLoomVersion
};
```

#### Added to `mergeConfigWithArgs` function:
```typescript
if (args.fabricLoomVersion && typeof args.fabricLoomVersion === 'string') {
  merged.mod.fabricLoomVersion = args.fabricLoomVersion.trim();
}
```

### 5. Template Variables (`src/template-variables.ts`)

#### Modified `generateTemplateVariables` function:
```typescript
fabric_loom_version: mod.fabricLoomVersion || DEFAULT_VARIABLES.fabric_loom_version!,
```

**Behavior**: Uses user-selected version if provided, otherwise falls back to default (1.11-SNAPSHOT).

### 6. Template Updates

#### Updated `templates/base/build.gradle`:
```diff
- id 'fabric-loom' version '1.11-SNAPSHOT' apply false
+ id 'fabric-loom' version '{{fabric_loom_version}}' apply false
```

#### Updated `templates/loaders/fabric/build.gradle`:
- No changes needed (inherits from base build.gradle)

#### Updated `templates/loaders/fabric/src/main/resources/fabric.mod.json`:
- Fixed missing commas in `suggests` section for JSON validity

### 7. Additional Fix: Forge Runtime Mods

#### Fixed `templates/loaders/forge/build.gradle`:
```diff
- modImplementation "maven.modrinth:jei:${jei_version}-forge"
+ implementation "maven.modrinth:jei:${jei_version}-forge"
- modImplementation "maven.modrinth:jade:${jade_version}+forge"
+ implementation "maven.modrinth:jade:${jade_version}+forge"
```

## Usage Examples

### Interactive Mode
```bash
create-minecraft-mod ./my-mod
# User selects Fabric loader
# System prompts: "Fabric Loom Version"
# User chooses from 1.10, 1.11, 1.12, 1.13
```

### CI Mode
```bash
create-minecraft-mod ./my-mod --ci-mode \
  --name "My Mod" \
  --author "Developer" \
  --loaders "fabric" \
  --fabric-loom-version "1.13"
```

### Config File Mode
```json
{
  "mod": {
    "name": "My Mod",
    "author": "Developer",
    "id": "my-mod",
    "fabricLoomVersion": "1.13"
  },
  "options": {
    "loaders": ["fabric"]
  }
}
```

## Backward Compatibility

- **Default Behavior**: When no version is specified, uses 1.11-SNAPSHOT
- **Conditional Prompt**: Only shows when Fabric loader is selected
- **Optional Property**: All new properties are optional with sensible defaults
- **Non-Fabric Projects**: Feature is completely invisible when Fabric not selected

## Version Management

### Supported Versions
- **1.10-SNAPSHOT**: Labeled as "Stable"
- **1.11-SNAPSHOT**: Labeled as "Current Default" (default choice)
- **1.12-SNAPSHOT**: Standard option
- **1.13-SNAPSHOT**: Labeled as "Latest"

### Version Format
- Users select version number (1.10, 1.11, 1.12, 1.13)
- System automatically appends "-SNAPSHOT" suffix
- Templates use `{{fabric_loom_version}}` Handlebars variable

## Files Modified

### Core Implementation
1. `src/cli.ts` - CLI argument parsing and help
2. `src/types.ts` - Type definitions
3. `src/index.ts` - Interactive prompt
4. `src/config-loader.ts` - Configuration file support
5. `src/template-variables.ts` - Variable generation

### Templates
6. `templates/base/build.gradle` - Loom version variable
7. `templates/loaders/forge/build.gradle` - Fixed Forge runtime mod syntax
8. `templates/loaders/fabric/src/main/resources/fabric.mod.json` - Fixed JSON commas

### Documentation
9. `FABRIC_LOOM_VERSION_IMPLEMENTATION.md` - This documentation file

## Future Reversal Instructions

When implementing automatic Loom version fetching, reverse the following changes:

### 1. Remove Interactive Prompt
- Delete the entire "FABRIC LOOM VERSION" section in `src/index.ts`
- Remove conditional logic `if (mod.loaders.includes('fabric'))`

### 2. Remove CLI Argument Support
- Remove `fabricLoomVersion?: string;` from `CliArgs` interface in `src/cli.ts`
- Remove argument parsing case for `--fabric-loom-version`
- Remove help text line

### 3. Remove Configuration Support
- Remove `fabricLoomVersion?: string;` from `ModConfigFile` in `src/config-loader.ts`
- Remove from `configToMod` return object
- Remove from `mergeConfigWithArgs` function

### 4. Remove Type Definitions
- Remove `fabricLoomVersion?: string;` from `Mod` interface in `src/types.ts`

### 5. Update Template Variables
- Revert template variable to use only API-fetched version:
```typescript
fabric_loom_version: fetchedLoomVersion || DEFAULT_VARIABLES.fabric_loom_version!,
```

### 6. Revert Template Changes
- Update `templates/base/build.gradle` back to automatic version
- Remove any explicit version setting

### 7. Keep Bug Fixes
- **DO NOT REVERT** the Forge `modImplementation` → `implementation` fix
- **DO NOT REVERT** the JSON comma fixes in fabric.mod.json
- These are unrelated bug fixes that should remain

## Testing

### Manual Testing Performed
1. ✅ CLI help shows new flag
2. ✅ Interactive prompt only appears when Fabric selected
3. ✅ Default selection works (1.11)
4. ✅ All version options generate correct format
5. ✅ Loom version mismatch error resolved
6. ✅ Backward compatibility maintained
7. ✅ Forge runtime mod syntax fixed

### Automated Testing Recommendations
1. Test interactive mode with various loader combinations
2. Test CI mode with `--fabric-loom-version` flag
3. Test config file mode with fabricLoomVersion property
4. Test backward compatibility (no version specified)
5. Test non-Fabric projects (no prompt should appear)

## Migration Notes

### For Existing Users
- No breaking changes - completely backward compatible
- Existing projects continue to work with 1.11-SNAPSHOT default
- New feature is opt-in

### For Configuration Files
- New optional property `mod.fabricLoomVersion` available
- Existing config files work without modification
- Can add version specification to existing configs

## Impact Assessment

### Positive Impact
- ✅ Resolves Loom version compatibility issues
- ✅ Provides user control over build tool versions
- ✅ Maintains backward compatibility
- ✅ Follows existing code patterns and conventions
- ✅ Added to all three modes (interactive, CI, config)

### Risks
- ⚠️ Future automation will require reversal of this manual selection feature
- ⚠️ Version compatibility needs maintenance (when versions become obsolete)

### Mitigations
- Comprehensive documentation provided for easy reversal
- Clear separation between manual selection and future automation
- Backward compatibility ensures no disruption to existing users