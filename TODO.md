# TODO: Architectural Refactoring Roadmap

## Overview

This document tracks the implementation of the modular architecture refactoring for the Minecraft Mod Generator CLI, focusing on improving maintainability, testability, and reducing complexity.

## Current Status

**Phase**: Phase 1 Foundation Utilities ✅ **COMPLETED**
**Implementation**: Phase 1 Complete ✅, Phase 2 Ready to Start 🔄
**Architecture**: Core utilities extracted, core.ts refactored (major progress)
**Testing Strategy**: Vitest setup complete ✅, Unit (95%+) + Integration coverage achieved

**Current Issues Found:**
- `src/index.ts`: 515 lines (god object - handles ALL modes) ⚠️ STILL NEEDS PHASE 2
- ✅ `src/utils/` directory exists (file-system.ts, pipeline-step.ts created)
- No `src/modes/` directory exists ⚠️ PHASE 2 NEEDED
- No `src/services/` directory exists ⚠️ PHASE 3 NEEDED
- ✅ Testing infrastructure exists (vitest.config.ts, 95%+ coverage achieved)
- ✅ Code duplication in file operations eliminated (core.ts refactored)

## Implementation Phases

### Phase 1: Foundation Utilities (Weeks 1-2)
**Risk**: Low | **Impact**: High | **Priority**: 1

#### ✅ COMPLETED - File System Operations Extraction
- [x] **File System Operations Extraction**
  - [x] Extract `findFilesByExtension()` utility (consolidated 4+ duplicate implementations)
  - [x] Extract `fileExists()` utility (consolidated 9+ instances of fs.access pattern)
  - [x] Extract `copyDirectory()` utility (eliminated 2 duplicate implementations)
  - [x] Extract `moveDirectory()` utility (with complex fallback logic)
  - **Impact**: Eliminated ~100+ lines of duplication from core.ts alone

#### ✅ COMPLETED - Pipeline Step Utilities
- [x] **Pipeline Step Utilities**
  - [x] Extract `withSpinner()` utility (replaced 16+ spinner patterns in core.ts)
  - [x] Enhanced with automatic success message handling
  - [x] Extract `withProgressSpinner()` utility (for progress updates)
  - **Impact**: Eliminated 34+ instances of spinner boilerplate across codebase

#### ⏳ Pending - Validation Utilities
- [ ] **Validation Utilities** (Lower Priority - existing validation is well-structured)
  - Extract common validation patterns
  - Create `validateStringInput()` utility
  - Create `validateConfiguration()` utility
  - **Impact**: Centralize scattered validation logic

#### ✅ COMPLETED - Testing Infrastructure
- [x] **Testing Infrastructure**
  - [x] Set up Vitest with coverage thresholds (80% global)
  - [x] Created comprehensive unit test suites
  - [x] Achieved 95%+ test coverage for utilities

#### 📋 Deliverables
- [x] `src/utils/file-system.ts` ✅ CREATED
- [x] `src/utils/pipeline-step.ts` ✅ CREATED
- [x] `src/utils/validation.ts` (deferred - existing validation is adequate)
- [x] Unit tests for all utilities (>95% coverage) ✅ COMPLETED
- [x] Integration tests for file system utilities ✅ COMPLETED

---

### Phase 2: Mode Separation (Weeks 3-4)
**Risk**: Medium | **Impact**: High | **Priority**: 2

#### ⏳ Pending
- [ ] **Split index.ts God Object**
  - Extract `src/modes/interactive-mode.ts` (user prompts only)
  - Extract `src/modes/headless-mode.ts` (CI/automation only)
  - Extract `src/modes/config-mode.ts` (config file only)
  - **Target**: Reduce index.ts from 515 lines to ~100 lines

- [ ] **Create Common Mode Interface**
  - Define `ModeHandler` interface
  - Implement `createModeHandler()` factory function
  - Extract `src/cli/argument-processor.ts`
  - **Impact**: Each mode independently testable

- [ ] **Pipeline Execution**
  - Extract `src/pipeline/execution.ts` (orchestration only)
  - Create `pipelineExecutor` function
  - **Impact**: Separate pipeline logic from CLI concerns

#### 📋 Deliverables
- [ ] `src/modes/interactive-mode.ts`
- [ ] `src/modes/headless-mode.ts`
- [ ] `src/modes/config-mode.ts`
- [ ] `src/cli/argument-processor.ts`
- [ ] `src/pipeline/execution.ts`
- [ ] Unit tests for all mode handlers
- [ ] Integration tests for mode orchestration

---

### Phase 3: Service Layer (Weeks 5-6)
**Risk**: Medium | **Impact**: Medium | **Priority**: 3

#### ⏳ Pending
- [ ] **Echo Registry API Service**
  - Create `src/services/echo-registry.ts`
  - Implement caching for API responses
  - Extract version fetching logic
  - Extract compatibility data processing
  - **Impact**: Centralize scattered API logic

- [ ] **Configuration Service**
  - Create `src/services/configuration.ts`
  - Simplify three-tier dependency system
  - Extract dependency resolution logic
  - Extract template variable generation
  - **Impact**: Replace complex configuration with clean model

- [ ] **Maven Coordinate Service**
  - Create `src/services/maven-coordinates.ts`
  - Extract coordinate processing logic
  - Standardize loader suffix handling
  - **Impact**: Centralize Maven coordinate handling

#### 📋 Deliverables
- [ ] `src/services/echo-registry.ts`
- [ ] `src/services/configuration.ts`
- [ ] `src/services/maven-coordinates.ts`
- [ ] Mock implementations for testing
- [ ] Integration tests for all services
- [ ] API service caching tests

---

### Phase 4: Pipeline Refactoring (Weeks 7-8)
**Risk**: High | **Impact**: High | **Priority**: 4

#### ⏳ Pending
- [ ] **Extract Pipeline Steps**
  - Create `src/pipeline/steps/template-cloner.ts`
  - Create `src/pipeline/steps/package-transformer.ts`
  - Create `src/pipeline/steps/class-renamer.ts`
  - Create `src/pipeline/steps/variable-applicator.ts`
  - Create `src/pipeline/steps/mixin-processor.ts`
  - **Impact**: Each step has single responsibility

- [ ] **Implement Pipeline Orchestrator**
  - Create `src/pipeline/pipeline.ts`
  - Implement step sequencing
  - Add error handling and rollback
  - Create progress reporting
  - **Impact**: Modular, testable pipeline execution

- [ ] **Refactor Large Pipeline Functions**
  - Break down `transformPackageStructure()` (currently 100+ lines)
  - Break down `applyTemplateVariables()` (currently 40+ lines)
  - Break down `renameClassFiles()` (currently 50+ lines)
  - **Target**: All functions < 50 lines

#### 📋 Deliverables
- [ ] Individual pipeline step files
- [ ] `src/pipeline/pipeline.ts` orchestrator
- [ ] Unit tests for each pipeline step
- [ ] Integration tests for pipeline orchestration
- [ ] Performance tests for large projects

---

## Success Metrics

### Code Quality Targets
- [ ] **Lines of Code**: Reduce by 15-20%
- [ ] **Function Complexity**: No function > 50 lines
- [ ] **Code Duplication**: < 5% (from current ~25%)
- [ ] **Cyclomatic Complexity**: Reduce by 50%

### Testing Targets
- [ ] **Unit Test Coverage**: > 90% for all new modules
- [ ] **Integration Test Coverage**: > 80% for module interactions
- [ ] **E2E Test Coverage**: All user workflows covered
- [ ] **Test Execution Time**: Unit < 5s, Integration < 30s, E2E < 2min

### Developer Experience Targets
- [ ] **Onboarding Time**: Reduce by 50%
- [ ] **Feature Development Time**: Reduce by 30%
- [ ] **Bug Fix Time**: Reduce by 40%
- [ ] **Code Review Time**: Reduce by 25%

## Risk Mitigation

### Low Risk Items
- ✅ **Utility extraction** (Phase 1) - Pure functions, no side effects
- [ ] **Interface creation** - Additive changes, no breaking changes
- [ ] **Test infrastructure** - Can coexist with existing code

### Medium Risk Items
- [ ] **Mode handler separation** - Requires careful coordination
- [ ] **Service layer creation** - Potential for regressions
- [ ] **Pipeline step extraction** - Needs thorough testing

### High Risk Items
- [ ] **Complete pipeline refactoring** - Highest risk, highest reward
- [ ] **Interface breaking changes** - Requires careful migration strategy
- [ ] **Architecture replacement** - Requires comprehensive testing

## Testing Strategy Implementation

### Unit Tests (60%)
- Pure business logic functions
- Data transformations
- Utility functions
- **Speed**: < 1 second per test file
- **Isolation**: Complete mocking of external dependencies

### Integration Tests (30%)
- Module interactions
- Service layer functionality
- Pipeline step coordination
- **Speed**: 5-30 seconds per test
- **Environment**: Real file system, mocked APIs

### End-to-End Tests (10%)
- Complete CLI workflows
- Real Gradle execution
- Generated project compilation
- **Speed**: 30 seconds - 2 minutes per test
- **Environment**: Full system integration

## Dependencies

### Required Tools & Packages
- [ ] `vitest` - Test runner
- [ ] `@vitest/coverage-v8` - Coverage reporting
- [ ] `@vitest/ui` - Visual test interface
- [ ] `@vitest/test-utils` - Testing utilities

### Required Infrastructure
- [ ] CI/CD pipeline updates for new test structure
- [ ] Coverage reporting integration
- [ ] Test data fixtures and templates
- [ ] Mock implementations for external APIs

## Timeline

```
Week 1-2: Phase 1 - Foundation Utilities
├── Week 1: File system and validation utilities
└── Week 2: Pipeline step utilities and testing

Week 3-4: Phase 2 - Mode Separation
├── Week 3: Split index.ts and create mode handlers
└── Week 4: CLI argument processing and pipeline execution

Week 5-6: Phase 3 - Service Layer
├── Week 5: Echo Registry and configuration services
└── Week 6: Maven coordinate service and testing

Week 7-8: Phase 4 - Pipeline Refactoring
├── Week 7: Extract pipeline steps
└── Week 8: Pipeline orchestrator and integration
```

## Blocking Issues

### None Currently 🎉

### Potential Future Blockers
- [ ] **Breaking Changes**: Any changes to public APIs may require coordination
- [ ] **Gradle Compatibility**: Changes must not break existing template functionality
- [ ] **Performance**: New architecture must maintain current performance levels

## Next Steps

1. **Review and Approve**: Review this roadmap with development team
2. **Resource Allocation**: Assign developers to specific phases
3. **Tooling Setup**: Install and configure Vitest and related tools
4. **Begin Phase 1**: Start with utility extraction (highest ROI)

## Notes

- This refactoring is designed to be **incremental** - each phase can be completed and tested independently
- **Backward compatibility** will be maintained during transition periods
- **Feature development** can continue in parallel with refactoring work
- **Regular code reviews** will ensure architectural consistency throughout the process

---

**Last Updated**: 2025-12-01
**Status**: Ready for Phase 1 Implementation
**Next Review**: After Phase 1 Completion