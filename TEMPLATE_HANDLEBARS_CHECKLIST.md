# Template Handlebars Variables Checklist

This file tracks which template files have been updated with `{{variable}}` handlebars variables for dynamic content generation.

## Template Structure

```
templates/
├── base/                           # Always included
│   ├── .gitignore
│   ├── .gitattributes
│   ├── changelog.md
│   ├── gradle.properties           # Build properties
│   ├── gradle/                     # Gradle wrapper
│   │   └── wrapper/
│   │       ├── gradle-wrapper.jar  # Binary - skip
│   │       └── gradle-wrapper.properties
│   ├── gradlew                     # Executable - skip
│   ├── gradlew.bat                 # Executable - skip
│   ├── README.md
│   ├── settings.gradle
│   ├── buildSrc/                   # Build artifacts (skip)
│   └── common/                     # Common module
│       └── src/main/
│           ├── java/
│           │   └── com/example/modtemplate/
│           │       ├── Constants.java
│           │       ├── TemplateMod.java
│           │       └── platform/
│           │           ├── Services.java
│           │           └── services/
│           │               └── IPlatformHelper.java
│           └── resources/
│               ├── examplemod.mixins.json
│               └── pack.mcmeta
├── loaders/                        # Loader-specific modules
│   ├── fabric/                     # Fabric loader
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── java/
│   │       │   └── com/example/modtemplate/
│   │       │       ├── TemplateFabric.java
│   │       │       ├── platform/
│   │       │       │   └── FabricPlatformHelper.java
│   │       │       └── fabric/
│   │       │           ├── TemplateDatagen.java
│   │       │           └── datagen/
│   │       │               ├── ModBlockLootTableProvider.java
│   │       │               ├── ModBlockTagProvider.java
│   │       │               ├── ModItemTagProvider.java
│   │       │               ├── ModModelProvider.java
│   │       │               └── ModRecipeProvider.java
│   │       └── resources/
│   │           ├── fabric.mod.json
│   │           ├── examplemod.fabric.mixins.json
│   │           └── META-INF/services/
│   │               └── com.example.modtemplate.platform.services.IPlatformHelper  # Generated
│   ├── forge/                      # Forge loader
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── java/
│   │       │   └── com/example/modtemplate/
│   │       │       ├── TemplateForge.java
│   │       │       └── platform/
│   │       │           └── ForgePlatformHelper.java
│   │       └── resources/
│   │           ├── META-INF/
│   │           │   ├── mods.toml
│   │           │   └── services/
│   │           │       └── com.example.modtemplate.platform.services.IPlatformHelper  # Generated
│   │           └── examplemod.forge.mixins.json
│   └── neoforge/                   # NeoForge loader
│       ├── build.gradle
│       └── src/main/
│           ├── java/
│           │   └── com/example/modtemplate/
│           │       ├── TemplateNeoForge.java
│           │       └── platform/
│           │           └── NeoForgePlatformHelper.java
│           └── resources/
│               ├── META-INF/
│               │   ├── neoforge.mods.toml
│               │   └── services/
│               │       └── com.example.modtemplate.platform.services.IPlatformHelper  # Generated
│               └── examplemod.neoforge.mixins.json
├── license/                        # License templates
│   ├── mit.txt
│   ├── lgpl.txt
│   └── arr.txt
├── samples/                        # Sample code templates (future)
├── workflows/                      # CI/CD workflows
└── meta/                          # Metadata and configuration
```

## Handlebars Implementation Status

### ✅ **COMPLETED** - Files with `{{variable}}` substitution
*Use this section to mark files as completed once handlebars variables are added*

### 📋 **PENDING** - Files needing `{{variable}}` substitution

#### Gradle Configuration Files
- [x] `base/gradle.properties` ✅ **COMPLETED** - 55 variables converted with comprehensive conditional logic
- [x] `base/settings.gradle` ✅ **COMPLETED** - 3 variables converted with loader conditional logic
- [x] `base/gradle/wrapper/gradle-wrapper.properties` ✅ **COMPLETED** - 1 variable converted (gradle_version)

#### Loader Build Files
- [x] `loaders/fabric/build.gradle` ✅ **COMPLETED** - Conditional logic added for optional libraries (modmenu, amber)
- [ ] `loaders/forge/build.gradle`
- [ ] `loaders/neoforge/build.gradle`

#### Common Module Java Files
- [ ] `base/common/src/main/java/com/example/modtemplate/Constants.java`
- [ ] `base/common/src/main/java/com/example/modtemplate/TemplateMod.java`
- [ ] `base/common/src/main/java/com/example/modtemplate/platform/Services.java`
- [ ] `base/common/src/main/java/com/example/modtemplate/platform/services/IPlatformHelper.java`

#### Common Module Resources
- [ ] `base/common/src/main/resources/examplemod.mixins.json`
- [ ] `base/common/src/main/resources/pack.mcmeta`

#### Fabric Loader Java Files
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/TemplateFabric.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/TemplateDatagen.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/platform/FabricPlatformHelper.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/datagen/ModBlockLootTableProvider.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/datagen/ModBlockTagProvider.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/datagen/ModItemTagProvider.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/datagen/ModModelProvider.java`
- [ ] `loaders/fabric/src/main/java/com/example/modtemplate/fabric/datagen/ModRecipeProvider.java`

#### Fabric Loader Resources
- [ ] `loaders/fabric/src/main/resources/fabric.mod.json`
- [ ] `loaders/fabric/src/main/resources/examplemod.fabric.mixins.json`

#### Forge Loader Java Files
- [ ] `loaders/forge/src/main/java/com/example/modtemplate/TemplateForge.java`
- [ ] `loaders/forge/src/main/java/com/example/modtemplate/platform/ForgePlatformHelper.java`

#### Forge Loader Resources
- [ ] `loaders/forge/src/main/resources/META-INF/mods.toml`
- [ ] `loaders/forge/src/main/resources/examplemod.forge.mixins.json`

#### NeoForge Loader Java Files
- [ ] `loaders/neoforge/src/main/java/com/example/modtemplate/TemplateNeoForge.java`
- [ ] `loaders/neoforge/src/main/java/com/example/modtemplate/platform/NeoForgePlatformHelper.java`

#### NeoForge Loader Resources
- [ ] `loaders/neoforge/src/main/resources/META-INF/neoforge.mods.toml`
- [ ] `loaders/neoforge/src/main/resources/examplemod.neoforge.mixins.json`

#### Documentation Files
- [ ] `base/README.md`
- [ ] `base/changelog.md`

#### License Files
- [ ] `license/mit.txt`
- [ ] `license/lgpl.txt`
- [ ] `license/arr.txt`

#### Service Registration Files (Skip - Generated Dynamically)
- [ ] `loaders/fabric/src/main/resources/META-INF/services/com.example.modtemplate.platform.services.IPlatformHelper` (Generated)
- [ ] `loaders/forge/src/main/resources/META-INF/services/com.example.modtemplate.platform.services.IPlatformHelper` (Generated)
- [ ] `loaders/neoforge/src/main/resources/META-INF/services/com.example.modtemplate.platform.services.IPlatformHelper` (Generated)

#### Binary/Generated Files (Skip)
- [ ] `base/gradle/wrapper/gradle-wrapper.jar` (Binary - skip)
- [ ] `base/gradlew` (Executable - skip)
- [ ] `base/gradlew.bat` (Executable - skip)

### 🔄 **PROCESSING STATUS**
- **Total Files**: 34
- **Completed**: 4
- **Pending**: 24
- **Skip (Generated)**: 3
- **Skip (Binary/Executable)**: 3

---

## Handlebars Variables Reference

### Core Project Variables
- `{{mod_name}}` - Display name of the mod
- `{{mod_id}}` - Technical identifier
- `{{mod_author}}` - Author name
- `{{description}}` - Short description
- `{{group}}` - Maven group identifier
- `{{version}}` - Mod version
- `{{license}}` - License identifier
- `{{package_base}}` - Java package base
- `{{package_path}}` - File system path for package
- `{{java_version}}` - Java version target
- `{{minecraft_version}}` - Target Minecraft version

### Class Name Variables
- `{{main_class_name}}` - Main mod class name
- `{{constants_class_name}}` - Constants class name
- `{{fabric_entry_class}}` - Fabric entry point class name
- `{{forge_entry_class}}` - Forge entry point class name
- `{{neoforge_entry_class}}` - NeoForge entry point class name
- `{{datagen_class_name}}` - Datagen entry point class name

### Platform Helper Variables
- `{{platform_helper_interface}}` - Platform helper interface name
- `{{fabric_platform_helper}}` - Fabric platform helper class name
- `{{forge_platform_helper}}` - Forge platform helper class name
- `{{neoforge_platform_helper}}` - NeoForge platform helper class name

### Build/Version Variables
- `{{fabric_version}}` - Fabric API version
- `{{fabric_loader_version}}` - Fabric Loader version
- `{{forge_version}}` - Forge version
- `{{neoforge_version}}` - NeoForge version
- `{{mod_menu_version}}` - ModMenu version
- `{{amber_version}}` - Amber library version

### Configuration Variables
- `{{mixin_min_version}}` - Minimum Mixin version
- `{{mixin_package}}` - Mixin package path
- `{{pack_format_version}}` - Resource pack format
- `{{mixin_refmap_name}}` - Mixin refmap filename

---

## Implementation Guidelines

### Priority Order
1. **Critical Configuration Files** (gradle.properties, build.gradle files)
2. **Java Class Files** (TemplateMod, Constants, entry points)
3. **Loader Configuration Files** (fabric.mod.json, mods.toml)
4. **Resource Files** (mixin JSON, pack.mcmeta)
5. **Documentation Files** (README.md, changelog.md)

### Important Notes
- **Preserve `${variable}` format** for Gradle configuration
- **Use `{{variable}}` format** for CLI-processed variables
- **Update package declarations** in Java files
- **Update class names** to use generated names
- **Service registration files** are generated dynamically - don't need handlebars
- **Binary files** should be skipped during processing

### File Types to Skip
- Binary files (.jar, .png, .jpg, .gif, .zip)
- Generated files (service registration - handled dynamically)
- Gradle wrapper jar