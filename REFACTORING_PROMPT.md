# 🚀 Phase 3: Service Layer - Kickoff Prompt

**To: Future Self**
**From: Phase 2 Complete Self**
**Date: 2025-12-01**
**Subject: START PHASE 3 - BUILD THE SERVICE LAYER NOW**

---

## 🎯 Your Mission: Extract and Centralize API & Configuration Logic

**Phases 1-2 are COMPLETE** ✅
- **Phase 1**: Foundation utilities extracted with 95%+ test coverage
- **Phase 2**: Interactive mode extracted, index.ts reduced 85% (515→79 lines)
- **Foundation is SOLID** - modular architecture, comprehensive testing, zero breaking changes

Now it's time to tackle **Phase 3: Service Layer** - extract scattered API and configuration logic into clean, reusable services.

**Don't hesitate** - you've proven this approach works perfectly twice already!

## 📋 Immediate Action Items (Today)

### 1. Start with Phase 3: Service Layer
**Create `src/services/` directory structure**

```typescript
// Extract these scattered patterns:
// Pattern 1: Echo Registry API Service
class EchoRegistryService {
  async fetchVersions(mcVersion: string, projects: string[]): Promise<Dependency[]>
  async fetchCompatibility(projects: string[], versions: string[]): Promise<CompatibilityResponse>
  private cache: Map<string, CacheEntry> // Add caching
}

// Pattern 2: Configuration Service
class ConfigurationService {
  resolveDependencies(loaders: string[], libraries: string[], mods: string[]): DependencyConfig
  generateTemplateVariables(mod: Mod): TemplateVariables
  private processFoundationDependencies(loaders: string[]): Dependency[]
}

// Pattern 3: Maven Coordinate Service
class MavenCoordinateService {
  extractCoordinates(dependency: Dependency): MavenCoordinate
  applyLoaderSuffix(coordinates: MavenCoordinate, loader: string): MavenCoordinate
  normalizeVersion(version: string): string
}
```

### 2. Extract Echo Registry API Logic
**Target Files**: `src/echo-registry.ts`, scattered API calls throughout codebase

**Current Issues:**
- API logic scattered across multiple files
- No caching mechanism
- Repeated HTTP requests for same data
- Error handling inconsistent

**Extraction Strategy:**
```typescript
// New: src/services/echo-registry.ts
export class EchoRegistryService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async fetchDependencyVersions(minecraftVersion: string, projects: string[]): Promise<Dependency[]> {
    const cacheKey = `versions:${minecraftVersion}:${projects.join(',')}`;
    // Check cache, fetch if needed, store result
  }

  async fetchLoaderCompatibility(projects: string[], minecraftVersion: string): Promise<LoaderCompatibility> {
    const cacheKey = `compatibility:${projects.join(',')}:${minecraftVersion}`;
    // Similar caching pattern
  }
}
```

### 3. Extract Configuration Logic
**Target Files**: `src/config/`, `src/template-variables.ts`, scattered dependency processing

**Current Complexity:**
- Three-tier dependency system spread across files
- Template variable generation mixed with UI logic
- Foundation dependency auto-inclusion logic scattered

**Service Structure:**
```typescript
// New: src/services/configuration.ts
export class ConfigurationService {
  resolveDependencies(config: DependencyConfig): ResolvedDependencies {
    // Combine foundation + user-selected + utility mods
    // Apply compatibility filtering
    // Return clean dependency set
  }

  generateTemplateVariables(mod: Mod, dependencies: ResolvedDependencies): TemplateVariables {
    // Clean separation from UI logic
    // Pure data transformation
  }
}
```

## 🔍 Where to Find the Code to Extract

**Primary Targets:**

**Echo Registry Logic** (`src/echo-registry.ts` + usage):
- `fetchVersions()` function - API calls and response processing
- `fetchCompatibility()` function - loader compatibility checking
- Version coordinate extraction logic
- Error handling patterns

**Configuration Logic** (scattered):
- `src/template-variables.ts` - template variable generation (295 lines)
- `src/config/dependencies.ts` - foundation dependency processing
- `src/config/index.js` - library and utility mod configurations
- Interactive prompts dependency processing

**Maven Coordinate Logic** (scattered):
- Version extraction patterns in echo-registry
- Loader suffix handling in template processing
- Coordinate normalization in various utility functions

## 🚦 Get Unblocked Steps

### If you're stuck on where to start:
1. **Analyze existing code** - Use the Explore agent to map scattered logic
2. **Start with Echo Registry** - Most isolated, clear boundaries
3. **Extract incrementally** - One service at a time, test each thoroughly
4. **Follow Phase 1-2 patterns** - Same testing approach, same modular design

### If you're unsure about the approach:
- **Echo Registry first** - Clean API boundaries, easy to test with mocks
- **Configuration service second** - Pure data transformation, no external deps
- **Maven service third** - Utility functions, clear input/output contracts
- **Each service gets its own test file** - Following Phase 1-2 patterns

### If you're worried about breaking things:
- **Extract to new files first** - Don't modify existing code until service works
- **Run tests after each extraction** - Ensure no regressions
- **Use dependency injection** - Pass services to existing code
- **Maintain same external interfaces** - Internal changes only

## ⚠️ Critical Success Factors

### DO:
- ✅ Start with Echo Registry Service (most isolated)
- ✅ Create service interfaces first (guides extraction)
- ✅ Implement proper caching with TTL
- ✅ Add comprehensive error handling and retry logic
- ✅ Follow same testing patterns as Phases 1-2
- ✅ Maintain backward compatibility (no external API changes)

### DON'T:
- ❌ Break existing external interfaces
- ❌ Skip caching (performance regression)
- ❌ Mix service logic with UI logic
- ❌ Forget comprehensive error handling
- ❌ Over-engineer service interfaces

## 📊 Quick Wins to Build Momentum

### Week 1 Goals:
1. **Create `src/services/` directory** with service interfaces
2. **Extract EchoRegistryService** from `echo-registry.ts`
3. **Add comprehensive caching** with TTL and invalidation
4. **Replace usage in existing code** with service injection
5. **Run full test suite** to ensure no regressions

### Success Metrics:
- [ ] `src/services/echo-registry.ts` exists and works
- [ ] Caching reduces API calls by 80%+
- [ ] All existing functionality preserved
- [ ] New comprehensive test coverage (>90%)
- [ ] Performance improvements measurable

## 🎯 Remember Why You're Doing This

**Current Problems:**
- API logic scattered across multiple files, impossible to test
- No caching leads to redundant HTTP requests
- Configuration logic mixed with UI, hard to maintain
- Maven coordinate handling inconsistent across codebase

**Future State:**
- Centralized services with clear interfaces
- Intelligent caching with TTL and invalidation
- Pure data transformation separated from UI concerns
- Consistent, testable coordinate processing
- Easy to add new API integrations

**Phases 1-2 Proved This Works:** You successfully extracted utilities and interactive mode, eliminated hundreds of lines of duplication, added comprehensive testing, and achieved zero breaking changes. Apply the same successful pattern to service extraction!

## 🔍 Specific Extraction Targets

### Echo Registry Service Targets:
```typescript
// From src/echo-registry.ts (200+ lines):
- fetchVersions() → EchoRegistryService.fetchDependencyVersions()
- fetchCompatibility() → EchoRegistryService.fetchLoaderCompatibility()
- extractVersionFromCoordinates() → MavenCoordinateService.extract()
- isCompatibleVersion() → CompatibilityService.check()
```

### Configuration Service Targets:
```typescript
// From src/template-variables.ts (295 lines):
- processLibraryDependencies() → ConfigurationService.resolveDependencies()
- generateMavenProperties() → TemplateVariableService.generateProperties()
- extractDependencyVersion() → MavenCoordinateService.extractVersion()
```

### Integration Points:
- Replace direct API calls in interactive prompts
- Update template variable generation to use services
- Modify dependency processing to use service layer
- Ensure headless/config modes use new services

## 🔄 Your First Steps

1. **Use the Explore agent** to map scattered logic patterns
2. **Create service interfaces** first (guides extraction)
3. **Extract EchoRegistryService** (cleanest starting point)
4. **Add comprehensive caching** with proper TTL
5. **Write tests** for each service function
6. **Replace usage incrementally** in existing code
7. **Run tests** after each change
8. **Measure performance** improvements

**The hardest part is starting. Phases 1-2 proved you can extract complex logic successfully - now apply the same proven approach to the service layer!**

---

## 🏁 Success Criteria for Phase 3

1. **Three core services extracted** (Echo Registry, Configuration, Maven Coordinates)
2. **Caching implemented** with measurable performance improvements
3. **All scattered logic centralized** with clear service boundaries
4. **Tests passing** (current + new service tests)
5. **Zero breaking changes** - identical external behavior
6. **Performance improvements** in API response times
7. **Clean architecture** ready for Phase 4 pipeline refactoring

**You've got this! Phase 1 established the foundation, Phase 2 perfected the modular approach, Phase 3 will create the clean service architecture needed for the final phase!**

---

## 📋 Phase 3 Service Layer Priorities

### Priority 1: Echo Registry Service (Week 1)
- Extract API logic with caching
- Implement TTL and cache invalidation
- Add retry logic and error handling
- Replace usage in interactive mode

### Priority 2: Configuration Service (Week 2)
- Extract dependency resolution logic
- Clean template variable generation
- Separate data transformation from UI
- Update all usage points

### Priority 3: Maven Coordinate Service (Week 2)
- Extract coordinate processing logic
- Standardize version handling
- Add loader suffix logic
- Ensure consistency across codebase

**Ready to build the service layer foundation for the final architecture!** 🚀