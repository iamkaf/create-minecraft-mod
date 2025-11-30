# Development Roadmap - Minecraft Mod Creator CLI

## Current Status

✅ **Production Ready** - Core functionality complete and tested
✅ **TypeScript Clean** - All compilation errors resolved
✅ **Full Pipeline** - 11/14 functions implemented (79%)

---

## 🎯 Remaining Tasks

### Medium Priority

#### 1. Project Finalization (`finalizeProject()`)
**Status**: Placeholder function
**Description**: Add project validation and cleanup logic after mod generation.

**Implementation Details**:
- Verify all required files exist and have correct permissions
- Validate generated configuration files (build.gradle, mod metadata files)
- Check that package structure matches user's specifications
- Ensure template variable substitution was successful
- Perform final cleanup operations
- Validate Gradle wrapper integrity and permissions

**Impact**: Improves project quality and provides final validation before user gets the generated project.

---

#### 2. Sample Code Injection System (`addSampleCode()`)
**Status**: Placeholder function
**Description**: Implement anchor-based sample code injection system with metadata.json.

**Architecture Requirements**:
- **Anchor-based injection system** with metadata.json files
- **Two injection modes**:
  - **Copy**: Direct file copy with Handlebars processing
  - **Inject**: Content injection into specific anchor points in existing files
- **Metadata-driven**: Each sample has JSON defining injection rules and dependencies
- **Multi-sample support**: Handle multiple samples injecting into the same anchor point
- **Collision resolution**: Manage injection order and conflicts when multiple samples target same anchors
- **Dynamic sample loading**: Support expanding sample library without code changes

**Sample Metadata Structure**:
```json
{
  "id": "basic-item",
  "name": "Basic Item",
  "description": "Adds a simple item to the mod",
  "mode": "inject",
  "anchors": [
    {
      "file": "src/main/java/com/example/mod/CommonMod.java",
      "position": "// ITEMS_PLACEHOLDER",
      "code": "public static final RegistryObject<Item> EXAMPLE_ITEM = Items.register(\"example_item\", () -> new Item(new Item.Properties()));"
    }
  ],
  "dependencies": [],
  "loaders": ["fabric", "forge", "neoforge"]
}
```

**Impact**: Transforms from basic template to powerful scaffolding system.

---

### High Priority

#### 3. Dependency Classification System (Critical)
**Status**: Core build dependencies incorrectly shown as optional libraries
**Description**: Fix fundamental misunderstanding in dependency classification that confuses users about what's optional vs required.

**Root Cause**: Build tools and core dependencies (Fabric API, Fabric Loom, ModDevGradle) are presented as user-selectable options when they should be automatically managed by the build system.

**Fix Required**:
- Redesign dependency classification UI/UX to separate core/build from optional libraries
- Update three-tier dependency architecture implementation
- Fix library presentation logic in interactive prompts
- Remove core build dependencies from user selection

**Impact**: Major UX improvement, removes confusion about required vs optional components

---

### Medium Priority

#### 4. License Enhancement (SPDX Integration)
**Status**: Manual file copying
**Description**: Replace manual license template copying with SPDX package integration.

**Current Issues**:
- Manual copying approach from static license templates
- Limited license types (MIT, LGPL, ARR only)
- No license text validation or formatting

**Implementation Requirements**:
- Use SPDX package for proper license text generation
- Support for additional license types
- Dynamic license text with proper year and author substitution
- License validation and compatibility checking

**Impact**: More professional license handling and better legal compliance.

---

#### 5. Multiple Template Support
**Status**: Single template system
**Description**: Support multiple base templates for different use cases.

**Template Types to Consider**:
- **Minimal**: Bare bones mod structure
- **Full-featured**: Complete mod with all features enabled
- **API Library**: Template for creating API/dependency mods
- **Data Pack**: Template for data-only mods
- **Mod Loader**: Template for creating loader modifications

**Implementation Requirements**:
- Template selection mechanism (interactive prompt, CLI flag, config file option)
- Template validation and compatibility checking
- Migration path for existing template system
- Template-specific documentation and examples

**Impact**: Extends CLI utility for broader use cases beyond standard mods.

---

## 📋 Implementation Order

### Phase 1: Core Architecture (Week 1)
1. **Dependency Classification System** - Fix core vs library presentation (Critical)
2. **Project Finalization** - Complete `finalizeProject()` function

### Phase 2: Advanced Features (Week 2-3)
3. **Sample Code System** - Complete anchor-based injection architecture
4. **License Enhancement** - SPDX integration

### Phase 3: Extensibility (Week 4)
5. **Multiple Templates** - Template selection and management system

---

## 🏗️ Technical Debt

### Completed ✅
- **TypeScript Compilation**: All 11 errors resolved
- **ESLint Setup**: Modern ESLint v9 with TypeScript integration (29 real issues found)
- **Pipeline Functions**: Removed redundant `updateJavaPackageDeclarations()`
- **Dependency Architecture**: Three-tier system working perfectly
- **Echo Registry Integration**: Full API integration with compatibility support
- **Maven Repository Management**: Proper exclusiveContent configuration
- **Package Transformation Bug**: Fixed interactive mode using robust pipeline implementation
- **VS Code Hanging Issue**: Fixed execa calls to use `.unref()` for proper background execution
- **Smart Package Defaults**: Implemented `com.author.modname` automatic package naming
- **Optional Sample Code**: Added "None" option to allow starting with empty project
- **Misleading Compatibility Warnings**: Fixed warning logic to only show true incompatibilities

### Future Considerations
- **Test Framework**: Implement comprehensive testing suite (see Testing Strategy section)
- **Documentation**: Expand API documentation for contributors
- **Performance**: Optimize large project generation times

---

## 🎊 Success Metrics

### Current State ✅
- ✅ **Type Safety**: Zero TypeScript compilation errors
- ✅ **Functionality**: 100% core pipeline working
- ✅ **Dependencies**: Modern Maven-based dependency management
- ✅ **Multi-loader**: Complete Fabric, Forge, NeoForge support
- ✅ **Templates**: Full Handlebars coverage
- ✅ **Production Ready**: CLI generates working mods successfully

### Target State
- 🎯 **Project Quality**: Full validation and cleanup
- 🎯 **Developer Experience**: Rich sample code library
- 🎯 **Extensibility**: Multiple template types
- 🎯 **Legal Compliance**: Professional license handling
- 🎯 **Maintainability**: Clean codebase with full test coverage

---

## 💡 Implementation Notes

**Priority Focus**: The remaining tasks significantly enhance developer experience but don't affect core functionality. The CLI is already production-ready for basic mod creation.

## 🧪 Testing Strategy

### Current Status
- **Manual Testing**: CLI integration testing with sample mod generation
- **Compatibility Testing**: Testing across all supported loaders (Fabric, Forge, NeoForge)
- **Functional Verification**: Generated mod projects build and run correctly

### Testing Framework Requirements

**Why We Need Automated Testing**
- **Pipeline Complexity**: 14-stage pipeline with external dependencies (Gradle, Git, file system)
- **Cross-Loader Support**: Need to verify Fabric, Forge, and NeoForge compatibility
- **Template System**: 53 template files with Handlebars processing
- **External APIs**: Echo Registry integration requires verification
- **Edge Cases**: Different Minecraft versions, dependency combinations, error scenarios

**Recommended Framework Options**
1. **Vitest + Vitest Coverage** - Modern, fast, TypeScript-first
2. **Jest + ts-jest** - Mature ecosystem, good for integration tests
3. **Node.js Test Runner + TAP** - Built-in, lightweight option

**Testing Categories Needed**
- **Unit Tests**: Core logic (template variables, dependency processing, pipeline utilities)
- **Integration Tests**: Full pipeline execution with mocked external dependencies
- **E2E Tests**: Complete mod generation with real file system and Gradle execution
- **Compatibility Tests**: Verify all loader combinations work correctly
- **Error Handling Tests**: Network failures, file permissions, invalid configurations

**Implementation Approach**
```bash
# Testing commands (when implemented)
npm run test              # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e        # End-to-end tests only
npm run test:coverage    # Run tests with coverage report
```

**Current Manual Testing Process**
```bash
# Verify functionality with test mod creation
cd /tmp && npx create-minecraft-mod test-mod --ci-mode \
  --name "Test Mod" --author "Test" --id "testmod" \
  --loaders "fabric,forge" --mods "jei,jade" \
  && cd test-mod && ./gradlew build
```

**Release Cadence**: Features can be released incrementally. Each completed task provides immediate value to users.