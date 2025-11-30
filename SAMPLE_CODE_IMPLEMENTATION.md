# Sample Code Injection System Implementation

## 🎯 Mission
Implement the `addSampleCode()` function to transform this CLI from a basic template generator into a powerful scaffolding tool that can inject pre-built code samples into generated mod projects.

## 📋 Current State
- `addSampleCode()` is currently a placeholder function in `src/pipeline.ts`
- Only provides user feedback: "Adding sample code to ${mod.name}..."
- No actual code injection functionality implemented
- This is the most impactful remaining feature for developer experience

## 🏗️ Architecture Requirements

### 1. Sample Code Metadata System
**File Location**: `samples/[category]/[sample-id]/metadata.json`

```json
{
  "id": "basic-item",
  "name": "Basic Item",
  "description": "Adds a simple item with basic functionality",
  "version": "1.0.0",
  "author": "CLI Generator",
  "category": "items",
  "tags": ["item", "basic", "utility"],
  "difficulty": "beginner",
  "loaders": ["fabric", "forge", "neoforge"],
  "minecraftVersions": ["1.21.10", "1.21.1", "1.20.1"],
  "dependencies": [],
  "compatibleSamples": ["basic-recipe"],
  "incompatibleSamples": [],
  "mode": "inject",
  "anchors": [
    {
      "file": "src/main/java/com/example/mod/common/CommonMod.java",
      "position": "// ITEMS_PLACEHOLDER",
      "after": true,
      "description": "Add item registration after placeholder"
    }
  ],
  "files": {
    "item-creation": {
      "path": "src/main/java/com/example/mod/common/item/ExampleItem.java",
      "mode": "copy",
      "template": true
    }
  }
}
```

### 2. Two Injection Modes

#### Mode: `inject`
Inject code snippets into existing files at anchor points.
- **Use Case**: Adding functionality to existing files
- **Example**: Add item registration to CommonMod.java

#### Mode: `copy`
Copy entire files to the project with Handlebars processing.
- **Use Case**: Adding new classes or files
- **Example**: Create ExampleItem.java file

### 3. Anchor System
**Anchor Format**: `// ANCHOR_NAME_PLACEHOLDER`

Common anchors to implement:
```java
// ITEMS_PLACEHOLDER
// BLOCKS_PLACEHOLDER
// ENTITIES_PLACEHOLDER
// RECIPES_PLACEHOLDER
// COMMANDS_PLACEHOLDER
// EVENTS_PLACEHOLDER
// CONFIG_PLACEHOLDER
```

### 4. Sample Categories
- **items**: Items, blocks, tools
- **recipes**: Crafting recipes, smelting, brewing
- **entities**: Mobs, entities, spawning
- **world-gen**: World generation, structures
- **commands**: Commands, permissions
- **events**: Event handling, listeners
- **gui**: UI components, screens
- **network**: Packets, networking
- **config**: Configuration files, settings
- **compatibility**: Cross-mod compatibility

## 🛠️ Implementation Plan

### Phase 1: Core Infrastructure
1. **Sample Discovery System** (`src/samples/sample-discovery.ts`)
   - Scan `samples/` directory for metadata.json files
   - Load and validate sample metadata
   - Cache sample information
   - Filter by compatibility (loader, version, dependencies)

2. **Anchor Management** (`src/samples/anchor-manager.ts`)
   - Find anchor points in generated files
   - Manage anchor insertion order
   - Handle multiple injections at same anchor

3. **Template Processing** (`src/samples/template-processor.ts`)
   - Apply Handlebars processing to sample files
   - Use same template variables as main pipeline
   - Handle sample-specific variables

### Phase 2: Injection Engine
4. **Code Injection Engine** (`src/samples/injection-engine.ts`)
   - Process `inject` mode samples
   - Insert code at anchor points with proper spacing
   - Handle multi-line code insertion
   - Manage import statements and dependencies

5. **File Copy System** (`src/samples/file-copier.ts`)
   - Process `copy` mode samples
   - Create directory structures as needed
   - Apply Handlebars template processing
   - Handle file name patterns

### Phase 3: User Integration
6. **CLI Integration** (update `src/index.ts`, CLI args)
   - Add `--samples` argument
   - Add sample selection prompts in interactive mode
   - Add sample selection to config file format

7. **Pipeline Integration** (update `src/pipeline.ts`)
   - Implement real `addSampleCode()` function
   - Process selected samples in dependency order
   - Handle sample compatibility conflicts
   - Provide progress feedback

## 📁 Directory Structure

```
samples/
├── items/
│   ├── basic-item/
│   │   ├── metadata.json
│   │   ├── item-creation/
│   │   │   └── BasicItem.java.template
│   │   └── docs.md
│   ├── food-item/
│   │   ├── metadata.json
│   │   ├── item-creation/
│   │   │   └── FoodItem.java.template
│   │   └── recipes/
│   │       └── basic-food-recipe.json.template
│   └── tool-item/
├── entities/
│   ├── basic-mob/
│   └── passive-animal/
├── world-gen/
│   ├── ore-generation/
│   └── structure/
├── commands/
├── gui/
├── network/
└── index.json (catalog of all samples)
```

## 🔄 Implementation Flow

### 1. Sample Selection
```typescript
interface SampleSelection {
  category: string;
  sampleId: string;
  mode: 'inject' | 'copy';
}
```

### 2. Dependency Resolution
- Check sample compatibility
- Resolve dependency chains
- Create execution order
- Handle conflicts

### 3. Execution Pipeline
```typescript
async function addSampleCode(mod: Mod): Promise<void> {
  // 1. Get selected samples from user input
  const selectedSamples = getSelectedSamples(mod);

  // 2. Resolve dependencies and create execution order
  const executionOrder = resolveSampleDependencies(selectedSamples);

  // 3. Execute samples in order
  for (const sample of executionOrder) {
    await processSample(sample, mod);
  }
}
```

## 📋 Sample Examples

### Basic Item Sample
**metadata.json**:
```json
{
  "id": "basic-item",
  "name": "Basic Item",
  "description": "Creates a simple item with basic functionality",
  "mode": "inject",
  "anchors": [
    {
      "file": "src/main/java/com/example/mod/common/CommonMod.java",
      "position": "// ITEMS_PLACEHOLDER",
      "after": true
    }
  ]
}
```

**Code to inject** (from template):
```java
public static final RegistryObject<Item> EXAMPLE_ITEM = Items.register("example_item",
    () -> new Item(new Item.Properties()));
```

### Recipe Sample
**metadata.json**:
```json
{
  "id": "basic-recipe",
  "name": "Basic Recipe",
  "description": "Adds a basic crafting recipe",
  "mode": "copy",
  "dependencies": ["basic-item"],
  "files": {
    "recipe": {
      "path": "src/main/resources/data/modid/recipes/example_item.json",
      "template": true
    }
  }
}
```

**Template file** (`recipe.json.template`):
```json
{
  "type": "minecraft:crafting_shaped",
  "pattern": [
    "X",
    "X"
  ],
  "key": {
    "X": {
      "item": "{{mod_id}}:example_item"
    }
  },
  "result": {
    "item": "{{mod_id}}:example_item",
    "count": 2
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
- Sample metadata validation
- Anchor detection and injection
- Template processing
- Dependency resolution

### Integration Tests
- Full sample injection pipeline
- Multiple sample combinations
- Cross-loader compatibility

### Manual Testing
```bash
# Test with specific samples
npm run start ./test-mod --ci-mode --name "Test Mod" \
  --samples "basic-item,basic-recipe" \
  --loaders "fabric" \
  --author "Test" --id "testmod"

# Verify generated files
cd test-mod
find . -name "*.java" | head -10
find . -name "*.json" | head -10
./gradlew build
```

## 🎯 Success Criteria

### Must Have
- ✅ Working `addSampleCode()` implementation
- ✅ At least 10 sample code examples covering different categories
- ✅ Both injection and copy modes working
- ✅ Template variable processing for sample files
- ✅ Anchor system with proper spacing and formatting

### Should Have
- ✅ CLI integration for sample selection
- ✅ Sample dependency resolution
- ✅ Compatibility filtering (loader, version)
- ✅ Progress feedback during sample processing

### Could Have
- ✅ Sample catalog generation
- ✅ Interactive sample browsing
- ✅ Sample documentation generation
- ✅ Custom sample creation tools

## 🚀 Getting Started

1. **Create sample structure**: `samples/items/basic-item/`
2. **Write metadata.json**: Define sample metadata
3. **Create template files**: Handlebars templates for code/files
4. **Test sample**: Use CLI to test injection
5. **Iterate**: Add more samples and features

## 📚 Resources
- Handlebars documentation for advanced template features
- Java naming conventions for Minecraft mods
- Minecraft modding best practices
- Gradle build system for mods

---

**Remember**: Start simple with 2-3 basic samples, test thoroughly, then expand the library. This feature has massive potential to transform the CLI from basic generator to powerful scaffolding platform!