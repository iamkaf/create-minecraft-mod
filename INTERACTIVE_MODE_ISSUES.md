# Interactive Mode Issues Documentation

## Overview

This document captures issues identified during testing of the interactive mode (`npm start`) that need to be addressed to improve user experience and correctness.

---

## Issue #1: Java Package Default Value is Too Simple

**Severity**: Medium
**Category**: UX/Default Value Issue

### Problem
The Java Package prompt defaults to just the mod ID ("bonded") instead of a proper Java package structure.

### Current Behavior
- Default value: `bonded`
- User must manually type proper package format like `com.author.modname`

### Expected Behavior
- Default value should be: `com.[author-name].[mod-name]`
- Parse from author and mod name inputs
- Convert to valid Java package format (lowercase, no special chars)

### Example
- Author: "iamkaf"
- Mod Name: "Bonded"
- Should default to: `com.iamkaf.bonded`

---

## Issue #2: Library vs Core Dependencies Classification Problem

**Severity**: High
**Category**: Architecture/Classification Issue

### Problem
The "Include Libraries" prompt shows core dependencies as if they were optional libraries, indicating a fundamental misunderstanding in the dependency classification system.

### Current Behavior
Libraries shown in prompt:
- ✅ Amber (correct - optional library)
- ❌ Fabric API (incorrect - core dependency)
- ❌ Fabric Loom (incorrect - build tool)
- ❌ ModDevGradle (incorrect - build tool plugin)

### Root Cause
This appears to be a deeper architectural issue where core/build dependencies are being mixed with optional libraries in the user interface.

### Expected Behavior
**Core Dependencies** (always included, managed by build system):
- Fabric API
- Fabric Loom
- ModDevGradle
- Gradle plugins
- Build tools

**Libraries** (optional, user-selectable):
- Amber (Kaf Mod Resources integration)
- Other future optional libraries

**Impact**: This misclassification is confusing to users and may affect the dependency management system.

---

## Issue #3: Sample Code Selection is Required (Not Optional)

**Severity**: Medium
**Category**: UX/Freedom of Choice Issue

### Problem
The "Include Sample Code" prompt forces users to select at least one option, but some users may want to start with an empty project.

### Current Behavior
- User must select at least one sample code option
- Cannot proceed without making a selection
- No "None" or "Skip sample code" option

### Expected Behavior
- Allow users to skip sample code entirely
- Add "None" option to proceed without samples
- Make sample code truly optional

### User Impact
- Advanced users who want to start from scratch are forced to include sample code
- Creates unnecessary cleanup work for experienced developers

---

## Issue #4: VS Code Command Hangs Pipeline Completion

**Severity**: High
**Category**: Process Management Bug

### Status: ✅ **FIXED** - Updated execa commands to use `.unref()` instead of `await`

### Problem
The command hangs with a spinner after the mod is generated, likely waiting for the VS Code process to exit.

### Root Cause
```typescript
// OLD CODE (causing hang):
await execa('code', [mod.destinationPath], { detached: true });

// NEW CODE (fixed):
execa('code', [mod.destinationPath], { detached: true }).unref();
```

### Current Behavior
- Pipeline completes mod generation successfully
- Opens VS Code correctly
- But hangs indefinitely waiting for VS Code process to exit
- User must manually cancel with Ctrl+C

### Expected Behavior
- Pipeline completes fully
- VS Code opens in background
- Terminal returns to prompt immediately

### Fix Applied
- Removed `await` from execa calls in `openInVSCode()` and `openInIntelliJ()`
- Added `.unref()` to detach child process properly
- Both VS Code and IntelliJ functions updated

---

## Issue #5: Misleading Compatibility Warnings

**Severity**: Medium
**Category**: UX/Communication Issue

### Problem
The system displays confusing and misleading warnings about dependency compatibility that don't reflect the actual conditional logic implemented in the templates.

### Current Warnings (Confusing)
```
▲ Fabric API will only work with: fabric
💡 Suggestion: Remove incompatible loaders: neoforge, forge

▲ Fabric Loom will only work with: fabric
💡 Suggestion: Remove incompatible loaders: neoforge, forge

▲ Mod Menu will only work with: fabric
💡 Suggestion: Remove incompatible loaders: neoforge, forge
```

### Reality
- The system already uses Handlebars to conditionally include dependencies
- Dependencies are only added to compatible loaders via template logic
- These warnings suggest manual action is needed when it's not

### Example of Actual Logic
Templates use conditional logic like:
```handlebars
{{#if (includes mods "fabric-api")}}
dependencies { implementation "net.fabricmc.fabric-api:fabric-api:{{fabric_api_version}}" }
{{/if}}
```

### Expected Behavior
- Remove misleading compatibility warnings for dependencies that are properly handled by conditional template logic
- Only show warnings for actual user selection conflicts
- Clarify that dependencies are automatically filtered by compatibility

### Impact
- Users get confused and may think they need to manually adjust configurations
- Reduces confidence in the automated dependency management
- Creates unnecessary cognitive load

---

## Priority Recommendations

### High Priority (Immediate Fix)
1. ✅ **Issue #4** - VS Code hanging (already fixed)
2. **Issue #2** - Dependency classification problem (architectural fix needed)

### Medium Priority (Next Sprint)
3. **Issue #1** - Smart Java package defaults
4. **Issue #3** - Make sample code truly optional
5. **Issue #5** - Remove misleading compatibility warnings

### Additional Investigation Needed
- **Issue #2** requires deeper analysis of the dependency classification system
- May need to review the entire three-tier dependency architecture
- Consider UI/UX implications of reorganizing library vs core dependency presentation

---

## Testing Notes

These issues were identified during interactive mode testing with:
- Mod Name: "Bonded"
- Author: "iamkaf"
- Package: "com.iamkaf.bonded"
- Loaders: "Fabric, NeoForge, Forge"
- Multiple libraries and utility mods selected

The pipeline completed successfully despite these UX and classification issues, indicating the core functionality works but needs UX improvements.