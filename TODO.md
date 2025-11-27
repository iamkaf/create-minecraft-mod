# TODO List - Minecraft Mod Creator CLI

## ✅ **COMPLETED** - Core Template Processing System

### Template Processing
- ✅ CLI argument parsing and destination path handling
- ✅ Complete user input collection (all prompts)
- ✅ Template structure copying from `templates/` directory
- ✅ Package folder transformation: `com/example/modtemplate/` → user package
- ✅ Java package declarations and imports updating
- ✅ Handlebars template variable substitution
- ✅ Service registration file generation
- ✅ Class name transformations (TemplateMod → UserModMod)
- ✅ Echo Registry API integration for addon versions
- ✅ Complete TemplateVariables interface (70+ variables)
- ✅ Multi-loader support (Fabric, Forge, NeoForge)

## 🚧 **REMAINING TASKS**

### Pipeline Functions
- [ ] `installLibraries()` - Enable selected libraries in build files
- [ ] `installUtilityMods()` - Add utility mod dependencies
- [ ] `addSampleCode()` - Generate sample code templates
- [ ] `applyLicense()` - Copy license files and update headers
- [ ] `configureLoaders()` - Set up loader-specific configurations

### Post-Creation Actions
- [ ] `runGradle()` - Execute actual Gradle commands
- [ ] `initializeGit()` - Git repository initialization
- [ ] `openInVSCode()` / `openInIntelliJ()` - IDE integration

### Template Files
- [ ] Add `{{variable}}` handlebars substitution to 28 template files
- See: `TEMPLATE_HANDLEBARS_CHECKLIST.md` for detailed tracking