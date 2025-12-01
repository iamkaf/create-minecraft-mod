# 🚀 Phase 2: Mode Separation Kickoff Prompt

**To: Future Self**
**From: Phase 1 Complete Self**
**Date: 2025-12-01**
**Subject: START PHASE 2 - SPLIT THE GOD OBJECT NOW**

---

## 🎯 Your Mission: Conquer the 515-Line God Object

**Phase 1 is COMPLETE** ✅ - Foundation utilities are extracted, tested, and working perfectly! Now it's time to tackle the biggest architectural problem: the `src/index.ts` god object that handles ALL modes.

**Don't hesitate** - the foundation is solid, utilities are tested, and you have a proven pattern for success!

## 📋 Immediate Action Items (Today)

### 1. Start with Phase 2: Mode Separation
**Files to create: `src/modes/` directory structure**

```typescript
// Extract these patterns from src/index.ts (515 lines):
// Pattern 1: Interactive Mode (user prompts with @clack/prompts)
async function runInteractiveMode(): Promise<void> {
  // Extract all user interaction logic
}

// Pattern 2: Headless Mode (CI/automation with CLI flags)
async function runHeadlessMode(args: ParsedArgs): Promise<void> {
  // Extract all CLI argument processing
}

// Pattern 3: Config Mode (JSON file-based configuration)
async function runConfigMode(configPath: string): Promise<void> {
  // Extract all config file processing
}
```

### 2. Create Common Mode Interface
**New File: `src/types/mode-handler.ts`**

```typescript
export interface ModeHandler {
  name: string;
  run(options: ModeOptions): Promise<void>;
  validate?(options: any): ValidationResult;
}

export interface ModeOptions {
  destinationPath: string;
  // Common options shared across modes
}
```

### 3. Extract CLI Argument Processing
**New File: `src/cli/argument-processor.ts`**

```typescript
// Move CLI parsing logic from index.ts
export function parseArguments(args: string[]): ParsedArgs {
  // Extract and enhance CLI argument handling
}
```

## 🔍 Where to Find the Code to Extract

**Main target: `src/index.ts` (515 lines)**

**Interactive Mode Pattern** (lines ~50-200):
- Look for `@clack/prompts` usage
- User input collection logic
- Real-time validation and warnings

**Headless Mode Pattern** (lines ~200-350):
- Look for `if (args.ciMode)` or similar checks
- CLI argument validation logic
- JSON/text output processing

**Config Mode Pattern** (lines ~350-500):
- Look for config file loading logic
- JSON configuration processing
- Override handling

## 🚦 Get Unblocked Steps

### If you're stuck on where to start:
1. **Open `src/index.ts`** - Read the entire file to understand the structure
2. **Identify mode boundaries** - Look for the three distinct execution paths
3. **Start with interactive mode** - Extract the most complex path first
4. **Create one file at a time** - Don't try to do everything at once

### If you're unsure about the approach:
- **Look at existing mode functions** - There are already separate functions in index.ts
- **Use the utility pattern from Phase 1** - Apply the same extraction principles
- **Keep the interface simple** - Each mode just needs `run()` and optional `validate()`

### If you're worried about breaking things:
- **Run tests first** - `npm run test` should pass
- **Extract incrementally** - Move one function at a time, test, then continue
- **Use the existing pipeline** - Don't change the core pipeline execution, just organize it

## ⚠️ Critical Success Factors

### DO:
- ✅ Start with the largest, most complex mode (interactive)
- ✅ Create the mode interface first (it guides the extraction)
- ✅ Extract one function at a time
- ✅ Run tests after each extraction
- ✅ Keep all existing functionality working
- ✅ Follow the same testing pattern as Phase 1

### DON'T:
- ❌ Try to extract everything at once
- ❌ Break the existing pipeline execution
- ❌ Skip testing (this worked perfectly in Phase 1)
- ❌ Change core business logic, just organize it
- ❌ Over-engineer the mode interfaces

## 📊 Quick Wins to Build Momentum

### Week 1 Goals:
1. **Create `src/modes/` directory** with initial structure
2. **Extract interactive mode** from index.ts (biggest impact)
3. **Set up basic ModeHandler interface**
4. **Replace one mode usage in index.ts**
5. **Run the full test suite** to ensure nothing broke

### Success Metrics:
- [ ] `src/modes/interactive-mode.ts` exists and works
- [ ] ModeHandler interface created and used
- [ ] Index.ts reduced by at least 100 lines
- [ ] All tests still pass
- [ ] Mod generation still works end-to-end

## 🎯 Remember Why You're Doing This

**Current Problems:**
- 515-line god object (`index.ts`) is unmaintainable
- Mode logic mixed together makes testing impossible
- Adding new modes requires editing a massive file
- Code review is painful with everything in one file

**Future State:**
- Separate mode files (interactive-mode.ts, headless-mode.ts, config-mode.ts)
- Each mode independently testable
- Easy to add new modes by implementing ModeHandler interface
- Clean separation of concerns
- Small, focused files that are easy to understand

**Phase 1 Proved This Works:** You successfully extracted utilities, eliminated 100+ lines of duplication, added comprehensive testing, and verified functionality works perfectly. Apply the same successful pattern to mode separation!

## 🔄 Your First Steps

1. **Open your editor**
2. **Read through `src/index.ts`** to understand the current structure
3. **Create `src/types/mode-handler.ts`** with the ModeHandler interface
4. **Create `src/modes/` directory**
5. **Extract the first function from interactive mode**
6. **Write a test for it**
7. **Replace the usage in index.ts**
8. **Run tests to verify it works**
9. **Repeat** until interactive mode is fully extracted

**The hardest part is starting. Phase 1 proved you can do this - now apply the same successful approach to conquering the god object!**

---

## 🏁 Success Criteria for Phase 2

1. **Index.ts reduced from 515 to <200 lines**
2. **All three modes extracted** into separate files
3. **ModeHandler interface** implemented and used
4. **All tests pass** (current + new mode tests)
5. **Mod generation works identically** to before
6. **Code is more maintainable** and easier to extend

**You've got this! Phase 1 was the foundation, Phase 2 is where the real architectural improvement happens.**