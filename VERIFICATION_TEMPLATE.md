# Minecraft Mod Creator - Verification Template

**Use this template for systematic verification of mod creation projects. Copy and rename for each verification session.**

## Project Information
**Test Date:** [Date]
**Project Name:** [Project Name]
**CLI Command:** [Full CLI command used]
**Requested Features:** [List all requested features]
**Execution Time:** [Duration]

---

## ✅ Pre-Verification Checklist

### Environment Setup
- [ ] Clean workspace (remove previous test outputs)
- [ ] Fresh CLI execution
- [ ] All dependencies available
- [ ] Sufficient disk space

### Test Parameters
- [ ] Destination path: [Path]
- [ ] Mod name: [Name]
- [ ] Author: [Author]
- [ ] Loaders: [List]
- [ ] Libraries: [List]
- [ ] Utility Mods: [List]
- [ ] Post-actions: [List]
- [ ] License type: [Type]

---

## 🔍 Step-by-Step Verification

### 1. Template Processing Verification

#### Handlebars Variable Substitution
```bash
# Command: grep -r "\{\{[^}]*\}\}" [project-path]
Expected: No matches
Result: [ ] ✅ No remaining handlebars | [ ] ❌ Found: [list]
```

#### Template Word References
```bash
# Command: grep -r -i "template" [project-path]
Expected: Only acceptable references (README, gradlew)
Result: [ ] ✅ Acceptable only | [ ] ❌ Problematic: [list]
```

#### Example Word References
```bash
# Command: grep -r -i "example" [project-path]
Expected: Only comments and placeholder URLs
Result: [ ] ✅ Acceptable only | [ ] ❌ Problematic: [list]
```

### 2. Multi-Loader Structure Verification

#### Directory Structure
```bash
# Command: ls -la [project-path]/
Expected: common/, fabric/, forge/, neoforge/
Result: [ ] ✅ All present | [ ] ❌ Missing: [list]
```

#### Loader Configuration Files
- [ ] **Fabric**: `fabric.mod.json` present?
- [ ] **Forge**: `META-INF/mods.toml` present?
- [ ] **NeoForge**: `META-INF/neoforge.mods.toml` present?
- [ ] **Mixin configs**: All loaders have mixin files?

#### Main Mod Classes
- [ ] **Fabric**: `VerificationModFabric.java` exists?
- [ ] **Forge**: `VerificationModForge.java` exists?
- [ ] **NeoForge**: `VerificationModNeoForge.java` exists?
- [ ] **Common**: `VerificationModMod.java` exists?

### 3. Package Structure Verification

#### Directory Transformation
```bash
# Expected: [project-name]/src/main/java/[correct-package]/
# Actual: Check structure
Expected package: [correct.package.name]
Result: [ ] ✅ Correct structure | [ ] ❌ Wrong structure: [actual]
```

#### Package Declarations
```bash
# Command: grep -r "^package.*;" [project-path]/src/main/java/
Expected: All files declare [correct.package.name]
Result: [ ] ✅ All correct | [ ] ❌ Incorrect: [list]
```

#### Service Registration Files
```bash
# Command: find [project-path] -name "*services*" -type f
Expected: Point to correct package classes
Result: [ ] ✅ Correct package | [ ] ❌ Wrong package: [details]
```

### 4. File Naming Verification

#### Mixin Configuration Files
```bash
Expected naming: [mod-id].mixins.json, [mod-id].[loader].mixins.json
Actual files: [list from find command]
Result: [ ] ✅ Correct naming | [ ] ❌ Wrong naming: [details]
```

#### Class File Names
```bash
# Check for template names vs expected names
Template class: TemplateDatagen.java → Expected: [ModName]Datagen.java
Result: [ ] ✅ Renamed correctly | [ ] ❌ Not renamed: [details]
```

### 5. Dependency Verification

#### Version Variables
```bash
# Command: grep -E "(version|Version)" [project-path]/gradle.properties
Expected: All requested libraries have version variables
```

**Library Versions:**
- [ ] amber_version: [value]
- [ ] cloth_config_version: [value]
- [ ] architectury_api_version: [value]

**Utility Mod Versions:**
- [ ] mod_menu_version: [value]
- [ ] jei_version: [value]
- [ ] jade_version: [value]
- [ ] sodium_version: [value]

#### Dependency Type Verification
**Critical Check**: Verify utility mods use correct dependency types
```bash
# Check Fabric build.gradle for modRuntimeOnly (runtime mods)
grep -n "modRuntimeOnly" [project-path]/fabric/build.gradle
# Check Forge build.gradle for runtimeOnly (runtime mods)
grep -n "runtimeOnly" [project-path]/forge/build.gradle
# Check NeoForge build.gradle for runtimeOnly (runtime mods)
grep -n "runtimeOnly" [project-path]/neoforge/build.gradle
```

**Expected Results:**
- [ ] **Fabric**: Runtime mods use `modRuntimeOnly` (e.g., jei, jade, sodium, modmenu) - FABRIC LOOM DEPENDENCY TYPE
- [ ] **Forge**: Runtime mods use `runtimeOnly` (e.g., jei, jade) - FORGE DEPENDENCY TYPE
- [ ] **NeoForge**: Runtime mods use `runtimeOnly` (e.g., jei, jade, sodium) - NEOFORGE DEPENDENCY TYPE
- [ ] **All Loaders**: Libraries use `implementation` (e.g., amber)

**Validation Notes:**
- ✅ **PASS**: Runtime mods use `runtimeOnly` or `modRuntimeOnly` for optional runtime dependencies
- ❌ **FAIL**: Any runtime mod uses `implementation` or `modImplementation` instead of proper runtime dependency type
- ❌ **FAIL**: Libraries use runtime dependency types instead of `implementation`

#### Fabric Loom Version Verification
```bash
# Check if fabric_loom_version exists in gradle.properties
grep -n "fabric_loom_version" [project-path]/gradle.properties
# Check if build.gradle uses the variable
grep -n "{{fabric_loom_version}}" [project-path]/build.gradle
# Check actual Loom version during build
grep -n "Fabric Loom:" [build-output]
```

**Expected Results:**
- [ ] **gradle.properties**: `fabric_loom_version=[version]-SNAPSHOT` present
- [ ] **build.gradle**: `{{fabric_loom_version}}` substituted correctly
- [ ] **Build Output**: Fabric Loom version matches expected version

#### Build.gradle Dependencies
**Fabric:**
```bash
# Check [project-path]/fabric/build.gradle dependencies section
Expected: All requested mods and libraries
```
- [ ] amber: [ ] ✅ Present | [ ] ❌ Missing
- [ ] cloth-config: [ ] ✅ Present | [ ] ❌ Missing
- [ ] architectury: [ ] ✅ Present | [ ] ❌ Missing
- [ ] modmenu: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jei: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jade: [ ] ✅ Present | [ ] ❌ Missing
- [ ] sodium: [ ] ✅ Present | [ ] ❌ Missing

**Forge:**
- [ ] amber: [ ] ✅ Present | [ ] ❌ Missing
- [ ] cloth-config: [ ] ✅ Present | [ ] ❌ Missing
- [ ] architectury: [ ] ✅ Present | [ ] ❌ Missing
- [ ] modmenu: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jei: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jade: [ ] ✅ Present | [ ] ❌ Missing
- [ ] sodium: [ ] ✅ Present | [ ] ❌ Missing

**NeoForge:**
- [ ] amber: [ ] ✅ Present | [ ] ❌ Missing
- [ ] cloth-config: [ ] ✅ Present | [ ] ❌ Missing
- [ ] architectury: [ ] ✅ Present | [ ] ❌ Missing
- [ ] modmenu: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jei: [ ] ✅ Present | [ ] ❌ Missing
- [ ] jade: [ ] ✅ Present | [ ] ❌ Missing
- [ ] sodium: [ ] ✅ Present | [ ] ❌ Missing

### 6. License Verification

#### License File
```bash
# Command: find [project-path] -name "LICENSE*" -type f
Expected: LICENSE file exists
Result: [ ] ✅ Present | [ ] ❌ Missing
```

#### License Content
```bash
# If file exists, check it's correct type
Expected: [License type] license text
Result: [ ] ✅ Correct | [ ] ❌ Wrong/Empty
```

#### License in Build
```bash
# Check build.gradle references
Expected: LICENSE file referenced correctly
Result: [ ] ✅ Referenced | [ ] ❌ Not referenced
```

### 7. Sample Code Verification

#### Sample Files Present
```bash
# Command: find [project-path] -name "*Sample*" -o -name "*Example*"
Expected: Sample code files exist (if requested)
Result: [ ] ✅ Present | [ ] ❌ Missing | [ ] ⚠️ Not requested
```

#### Sample Code Content
- [ ] Item registration examples?
- [ ] Data generation examples?
- [ ] Command examples?
- [ ] Mixin examples?

### 8. Gradle Build Verification

#### Gradle Configuration
```bash
# Command: ./gradlew help (from project directory)
Expected: BUILD SUCCESSFUL
Result: [ ] ✅ Success | [ ] ❌ Failed: [error]
```

#### Multi-Project Structure
```bash
# Check settings.gradle
Expected: All subprojects included
Result: [ ] ✅ Correct | [ ] ❌ Issues: [details]
```

#### Build Tasks
- [ ] Common project builds?
- [ ] Fabric project builds?
- [ ] Forge project builds?
- [ ] NeoForge project builds?

---

## 📊 Success Metrics

### Overall Success Rate: [X]%

### Component Success Rates:
- Template Processing: [X]%
- Multi-Loader Structure: [X]%
- Package Transformation: [X]%
- Dependency Management: [X]%
- File Naming: [X]%
- License Application: [X]%
- Gradle Integration: [X]%

### Performance:
- Execution Time: [X seconds]
- File Count: [X files, X directories]
- Build Time: [X seconds]

---

## 🐛 Issues Found

### Critical Issues (Blockers)
1. [Description of critical issue]
   - Impact: [What it breaks]
   - Evidence: [Commands/output]
   - Expected: [What should happen]
   - Actual: [What actually happened]

### Major Issues (Features)
1. [Description of major issue]
   - Impact: [What feature is broken]
   - Evidence: [Commands/output]

### Minor Issues (Cosmetic)
1. [Description of minor issue]
   - Impact: [Minor impact]
   - Evidence: [Commands/output]

---

## ✅ Positive Findings

1. [What worked well]
2. [Unexpected success]
3. [Performance improvements]
4. [User experience wins]

---

## 🔧 Recommended Actions

### Immediate (Critical)
- [ ] Fix [issue 1]
- [ ] Fix [issue 2]

### Short Term (Major)
- [ ] Implement [missing feature]
- [ ] Improve [existing feature]

### Long Term (Enhancement)
- [ ] Add [enhancement]
- [ ] Optimize [area]

---

## 📝 Notes

[Additional observations, context, or comments that don't fit elsewhere]

---

## ✅ Verification Complete

**Final Status:** [ ] ✅ Ready for Release | [ ] ⚠️ Ready with Limitations | [ ] ❌ Not Ready

**Verified By:** [Name/Initials]
**Next Verification Date:** [Date]

---

## Template Usage Instructions

1. Copy this template for each verification session
2. Fill in the Project Information section
3. Work through each verification step systematically
4. Use the provided bash commands for objective testing
5. Document findings with specific evidence (commands, outputs)
6. Update success metrics and issues found
7. Generate final recommendations

**Tips:**
- Be specific about commands used
- Include actual error messages/output
- Use the tree command to show structure issues
- Check both file existence AND file content
- Verify requested features vs delivered features