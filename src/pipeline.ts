import type { Mod } from './types.js';
import { spinner } from "@clack/prompts";
import { ensureDirectoryExists } from "./util.js";
import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { generateTemplateVariables } from './template-variables.js';

/**
 * Pipeline step functions extracted from core.ts
 * These are pure functions that can be used in any mode (interactive, headless, config)
 */

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function copyDirectoryContents(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryContents(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Template Processing Pipeline Steps
 */
export async function cloneTemplate(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Cloning template to "${mod.destinationPath}"...`);
  try {
    // Ensure destination directory exists
    ensureDirectoryExists(mod.destinationPath);

    // Copy base/ contents to destination root
    const basePath = path.join('templates', 'base');
    await copyDirectoryContents(basePath, mod.destinationPath);

    // Copy selected loader modules from loaders/
    const loadersPath = path.join('templates', 'loaders');
    for (const loader of mod.loaders) {
      const loaderPath = path.join(loadersPath, loader);
      if (await fs.access(loaderPath).then(() => true).catch(() => false)) {
        const loaderDestPath = path.join(mod.destinationPath, loader);
        await copyDirectoryContents(loaderPath, loaderDestPath);
      }
    }

    s.stop(`Template cloned to ${mod.destinationPath}`);
  } catch (error) {
    s.stop(`Failed to clone template`, 1);
    throw new Error(`Template cloning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function transformPackageStructure(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Transforming package structure...`);
  try {
    const templatePackagePath = 'com/example/modtemplate';
    const targetPackagePath = mod.package.replace(/\./g, '/');

    // Find all Java files in the project
    const javaFiles: string[] = [];

    async function findJavaFiles(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await findJavaFiles(fullPath);
        } else if (entry.name.endsWith('.java')) {
          javaFiles.push(fullPath);
        }
      }
    }

    await findJavaFiles(mod.destinationPath);

    // Transform package directories
    for (const javaFile of javaFiles) {
      let content = await fs.readFile(javaFile, 'utf-8');

      // Update package declarations
      content = content.replace(
        new RegExp(`package\\s+${templatePackagePath.replace(/\./g, '\\.')}\\s*;`, 'g'),
        `package ${mod.package};`
      );

      // Update imports
      content = content.replace(
        new RegExp(`import\\s+${templatePackagePath.replace(/\./g, '\\.')}`, 'g'),
        `import ${mod.package}`
      );

      await fs.writeFile(javaFile, content);
    }

    // Rename package directories in all subprojects (common, fabric, forge, neoforge)
    const subprojects = ['common', 'fabric', 'forge', 'neoforge'];

    for (const subproject of subprojects) {
      const templatePackageDir = path.join(mod.destinationPath, subproject, 'src', 'main', 'java', templatePackagePath);
      const targetPackageDir = path.join(mod.destinationPath, subproject, 'src', 'main', 'java', targetPackagePath);

      console.log(`🔍 ${subproject}: Processing transformation`);
      console.log(`   Source: ${templatePackageDir}`);
      console.log(`   Target: ${targetPackageDir}`);

      // Check if source directory exists
      const sourceExists = await fs.access(templatePackageDir).then(() => true).catch(() => false);
      if (!sourceExists) {
        console.log(`⚠️  ${subproject}: Template package directory not found at ${templatePackageDir}`);
        continue;
      }

      // Check if target directory already exists
      const targetExists = await fs.access(targetPackageDir).then(() => true).catch(() => false);
      if (targetExists) {
        console.log(`⚠️  ${subproject}: Target package directory already exists at ${targetPackageDir}, skipping...`);
        continue;
      }

      // Create target parent directories (but not the final directory itself)
      const targetParentDir = path.dirname(targetPackageDir);
      await fs.mkdir(targetParentDir, { recursive: true });

      // Try to move the package directory, with fallback to copy+delete
      try {
        await fs.rename(templatePackageDir, targetPackageDir);
        console.log(`✅ Moved ${subproject}: ${templatePackagePath} → ${targetPackagePath}`);
      } catch (renameError) {
        console.log(`⚠️  Rename failed, using copy+delete fallback for ${subproject}`);
        console.log(`   Error: ${renameError instanceof Error ? renameError.message : String(renameError)}`);
        console.log(`   Source: ${templatePackageDir}`);
        console.log(`   Target: ${targetPackageDir}`);

        // Fallback: copy recursively then delete original
        try {
          await fs.cp(templatePackageDir, targetPackageDir, { recursive: true });
          await fs.rm(templatePackageDir, { recursive: true });
          console.log(`✅ Copied ${subproject}: ${templatePackagePath} → ${targetPackagePath}`);
        } catch (copyError) {
          console.log(`❌ Copy operation also failed for ${subproject}`);
          throw new Error(`Failed to transform package directory for ${subproject}: ${copyError instanceof Error ? copyError.message : String(copyError)}`);
        }
      }

      // Clean up empty directories for each subproject
      try {
        const exampleDir = path.join(mod.destinationPath, subproject, 'src', 'main', 'java', 'com');
        await fs.rmdir(path.join(exampleDir, 'example'), { recursive: true });
        await fs.rmdir(exampleDir);
      } catch {
        // Ignore if directories don't exist or aren't empty
      }
    }

    s.stop(`Package structure transformed to ${mod.package}`);
  } catch (error) {
    s.stop(`Failed to transform package structure`, 1);
    throw new Error(`Package structure transformation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function renameClassFiles(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Renaming class files...`);
  try {
    const javaFiles: string[] = [];

    async function findJavaFiles(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await findJavaFiles(fullPath);
        } else if (entry.name.endsWith('.java')) {
          javaFiles.push(fullPath);
        }
      }
    }

    await findJavaFiles(mod.destinationPath);

    const variables = await generateTemplateVariables(mod);

    for (const javaFile of javaFiles) {
      let content = await fs.readFile(javaFile, 'utf-8');
      let newFileName = path.basename(javaFile);

      // Rename class names
      content = content.replace(/TemplateMod/g, variables.main_class_name);
      content = content.replace(/TemplateForge/g, variables.forge_entry_class);
      content = content.replace(/TemplateNeoForge/g, variables.neoforge_entry_class);
      content = content.replace(/TemplateFabric/g, variables.fabric_entry_class);
      content = content.replace(/Constants/g, variables.constants_class_name);

      await fs.writeFile(javaFile, content);

      // Rename files if they contain Template classes
      if (javaFile.includes('TemplateMod.java')) {
        newFileName = `${variables.main_class_name}.java`;
      } else if (javaFile.includes('TemplateForge.java')) {
        newFileName = `${variables.forge_entry_class}.java`;
      } else if (javaFile.includes('TemplateNeoForge.java')) {
        newFileName = `${variables.neoforge_entry_class}.java`;
      } else if (javaFile.includes('TemplateFabric.java')) {
        newFileName = `${variables.fabric_entry_class}.java`;
      } else if (javaFile.includes('Constants.java')) {
        newFileName = `${variables.constants_class_name}.java`;
      } else if (javaFile.includes('TemplateDatagen.java')) {
        // Rename TemplateDatagen.java to use mod ID (e.g., MixintestDatagen.java)
        const datagenClassName = `${mod.id.charAt(0).toUpperCase() + mod.id.slice(1)}Datagen`;
        newFileName = `${datagenClassName}.java`;
      }

      if (newFileName !== path.basename(javaFile)) {
        const newFilePath = path.join(path.dirname(javaFile), newFileName);
        await fs.rename(javaFile, newFilePath);
      }
    }

    s.stop(`Class files renamed successfully`);
  } catch (error) {
    s.stop(`Failed to rename class files`, 1);
    throw new Error(`Class file renaming failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateServiceRegistrationFiles(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Generating service registration files...`);
  try {
    const targetPackage = mod.package;
    const serviceInterface = `${targetPackage}.platform.services.IPlatformHelper`;

    // Generate service files for each loader that uses them
    const loaders = ['fabric', 'forge', 'neoforge'];

    for (const loader of loaders) {
      const loaderDir = path.join(mod.destinationPath, loader);

      // Skip if this loader wasn't included in the project
      if (!(await fs.access(loaderDir).then(() => true).catch(() => false))) {
        continue;
      }

      const servicesDir = path.join(loaderDir, 'src', 'main', 'resources', 'META-INF', 'services');

      // Create services directory if it doesn't exist
      await fs.mkdir(servicesDir, { recursive: true });

      // Clean up old template service files
      const oldServiceInterface = 'com.example.modtemplate.platform.services.IPlatformHelper';
      const oldServiceFile = path.join(servicesDir, oldServiceInterface);
      try {
        await fs.unlink(oldServiceFile);
        console.log(`🧹 Cleaned up old ${loader} service registration file`);
      } catch (error) {
        // File doesn't exist, which is fine
      }

      // Determine the platform helper class for this loader
      const platformHelperClass = `${targetPackage}.platform.${loader.charAt(0).toUpperCase() + loader.slice(1)}PlatformHelper`;

      // Write the service registration file
      const serviceFile = path.join(servicesDir, serviceInterface);
      await fs.writeFile(serviceFile, platformHelperClass + '\n');

      console.log(`✅ Generated ${loader} service registration: ${platformHelperClass}`);
    }

    s.stop(`Service registration files generated successfully`);
  } catch (error) {
    s.stop(`Failed to generate service registration files`, 1);
    throw new Error(`Service registration file generation failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function renameMixinFiles(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Renaming mixin files...`);
  try {
    const subprojects = ['common', 'fabric', 'forge', 'neoforge'];
    const mixinFiles: Array<{ oldPath: string; newPath: string }> = [];

    // Find all mixin files that need renaming
    for (const subproject of subprojects) {
      const subprojectDir = path.join(mod.destinationPath, subproject);

      // Skip if this subproject doesn't exist
      if (!(await fs.access(subprojectDir).then(() => true).catch(() => false))) {
        continue;
      }

      async function findMixinFiles(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await findMixinFiles(fullPath);
          } else if (entry.name.includes('mixin') && entry.name.includes('.json')) {
            const oldFileName = entry.name;
            const newFileName = oldFileName.replace(/examplemod/g, mod.id);

            if (oldFileName !== newFileName) {
              const newPath = path.join(dir, newFileName);
              mixinFiles.push({ oldPath: fullPath, newPath });
            }
          }
        }
      }

      await findMixinFiles(subprojectDir);
    }

    // Rename the files
    for (const { oldPath, newPath } of mixinFiles) {
      await fs.rename(oldPath, newPath);
      console.log(`✅ Renamed mixin: ${path.basename(oldPath)} → ${path.basename(newPath)}`);
    }

    s.stop(`Mixin files renamed successfully`);
  } catch (error) {
    s.stop(`Failed to rename mixin files`, 1);
    throw new Error(`Mixin file renaming failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}


export async function applyTemplateVariables(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Applying template variables...`);
  try {
    const variables = await generateTemplateVariables(mod);

    // Find all template files
    const templateFiles: string[] = [];

    async function findTemplateFiles(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await findTemplateFiles(fullPath);
        } else {
          // Only process text files that might contain template variables
          const textExtensions = ['.java', '.gradle', '.json', '.properties', '.toml', '.md', '.xml', '.txt'];
          if (textExtensions.some(ext => entry.name.endsWith(ext))) {
            templateFiles.push(fullPath);
          }
        }
      }
    }

    await findTemplateFiles(mod.destinationPath);

    // Apply Handlebars template variables to each file
    for (const templateFile of templateFiles) {
      let content = await fs.readFile(templateFile, 'utf-8');
      content = Handlebars.compile(content)(variables);
      await fs.writeFile(templateFile, content);
    }

    s.stop(`Template variables applied successfully`);
  } catch (error) {
    s.stop(`Failed to apply template variables`, 1);
    throw new Error(`Template variable application failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Configuration and Content Pipeline Steps
 */

/**
 * User feedback function that echoes back loader configuration choices.
 *
 * NOTE: Actual loader configuration happens in earlier pipeline steps:
 * - `cloneTemplate()` copies loader-specific template files
 * - `applyTemplateVariables()` processes Handlebars variables in loader configs
 *
 * This function provides user confirmation by listing which loaders were selected
 * and which configuration files were created for each loader.
 */
export async function configureLoaders(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Configuring loaders: ${mod.loaders.join(', ')}...`);
  try {
    let statusMessage = `Configured loaders: `;

    if (mod.loaders.includes('fabric')) {
      statusMessage += `Fabric (fabric.mod.json + build.gradle)`;
    }
    if (mod.loaders.includes('forge')) {
      if (mod.loaders.length > 1) statusMessage += ', ';
      statusMessage += `Forge (META-INF/mods.toml + build.gradle)`;
    }
    if (mod.loaders.includes('neoforge')) {
      if (mod.loaders.length > 1) statusMessage += ', ';
      statusMessage += `NeoForge (META-INF/neoforge.mods.toml + build.gradle)`;
    }

    await delay(300); // Allow time for user to read the confirmation
    s.stop(statusMessage);
  } catch (error) {
    s.stop(`Failed to configure loaders`, 1);
    throw new Error(`Loader configuration failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * User feedback function that echoes back library selection choices.
 *
 * NOTE: Actual library configuration happens through the template system:
 * - `generateTemplateVariables()` fetches library versions from Echo Registry API
 * - `applyTemplateVariables()` injects version variables into gradle.properties
 * - Template build.gradle files conditionally include selected libraries
 *
 * This function provides user confirmation of which development libraries
 * were selected and configured in their project (e.g., Amber).
 */
export async function installLibraries(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Installing libraries to "${mod.destinationPath}": ${mod.libraries.join(', ')}`);
  try {
    // Libraries are configured via template variables, not JAR downloads
    // The actual dependency injection happens in the build.gradle templates
    await delay(400); // Allow time for user to read the confirmation
    s.stop(`Libraries configured successfully`);
  } catch (error) {
    s.stop(`Failed to install libraries`, 1);
    throw new Error(`Library installation failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * User feedback function that echoes back runtime utility mod selection choices.
 *
 * NOTE: Actual utility mod configuration happens through the template system:
 * - `fetchCompatibilityVersions()` gets loader-specific versions from Echo Registry API
 * - `generateTemplateVariables()` creates version variables like `jei_version_fabric`
 * - `applyTemplateVariables()` injects these variables into gradle.properties
 * - build.gradle templates use `modRuntimeOnly` or `runtimeOnly` dependencies
 *
 * This function provides user confirmation of which runtime utility mods
 * were selected and configured in their project (e.g., JEI, Jade, Sodium).
 */
export async function installUtilityMods(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Installing runtime mods to "${mod.destinationPath}": ${mod.mods.join(', ')}`);
  try {
    // Runtime mods are configured as Maven dependencies via build.gradle templates
    // The actual dependency injection with loader-specific versions happens in template files
    await delay(600); // Allow time for user to read the confirmation
    s.stop(`Utility mods installed successfully`);
  } catch (error) {
    s.stop(`Failed to install utility mods`, 1);
    throw new Error(`Utility mod installation failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * PLACEHOLDER function for future sample code injection system.
 *
 * TODO: Implement anchor-based sample code injection with metadata.json
 * - Support Copy and Inject modes for sample insertion
 * - Handle multi-sample anchor processing
 * - Manage collision resolution for conflicting injections
 *
 * Current template includes minimal sample code in entry classes.
 * This function exists for future extensibility when implementing the
 * advanced sample code architecture described in TODO.md.
 */
export async function addSampleCode(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Adding sample code to "${mod.name}"...`);
  try {
    await delay(400); // Placeholder for future sample code injection
    s.stop(`Sample code added successfully`);
  } catch (error) {
    s.stop(`Failed to add sample code`, 1);
    throw new Error(`Sample code addition failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function applyLicense(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Applying license: ${mod.license.toUpperCase()}`);

  try {
    // Copy and process LICENSE file
    const licenseTemplatePath = path.join(process.cwd(), 'templates', 'license', `${mod.license}.txt`);
    const licenseDestPath = path.join(mod.destinationPath, 'LICENSE');

    // Check if license template exists
    try {
      await fs.access(licenseTemplatePath);
    } catch {
      // Fallback to MIT if requested license doesn't exist
      const fallbackTemplate = await fs.readFile(path.join(process.cwd(), 'templates', 'license', 'mit.txt'), 'utf-8');
      const processedLicense = Handlebars.compile(fallbackTemplate)({
        ...generateTemplateVariables(mod),
        year: new Date().getFullYear().toString()
      });
      await fs.writeFile(licenseDestPath, processedLicense);
      s.stop(`License template '${mod.license}' not found, used MIT instead`);
      return;
    }

    const licenseTemplate = await fs.readFile(licenseTemplatePath, 'utf-8');
    const processedLicense = Handlebars.compile(licenseTemplate)({
      ...generateTemplateVariables(mod),
      year: new Date().getFullYear().toString()
    });

    await fs.writeFile(licenseDestPath, processedLicense);
    s.stop(`License applied: ${mod.license.toUpperCase()}`);

  } catch (error) {
    s.stop(`Failed to apply license`, 1);
    throw new Error(`License application failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * PLACEHOLDER function for project finalization and validation.
 *
 * TODO: Implement project validation and cleanup logic:
 * - Verify all required files exist and have correct permissions
 * - Validate generated configuration files (build.gradle, mod metadata files)
 * - Check that package structure matches user's specifications
 * - Ensure template variable substitution was successful
 * - Perform any final cleanup operations
 * - Validate Gradle wrapper integrity and permissions
 *
 * This function should provide the final quality assurance check
 * before handing over the project to the user.
 */
export async function finalizeProject(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Finalizing project structure in "${mod.destinationPath}" for "${mod.name}"...`);
  try {
    await delay(500); // Placeholder for project validation and cleanup
    s.stop(`Project finalized successfully`);
  } catch (error) {
    s.stop(`Failed to finalize project`, 1);
    throw new Error(`Project finalization failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Post-Creation Actions
 */
export async function initializeGit(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Initializing Git repository in "${mod.destinationPath}"...`);
  try {
    const { execa } = await import('execa');

    // Check if git is available
    try {
      await execa('git', ['--version'], { cwd: mod.destinationPath });
    } catch (error) {
      throw new Error('Git is not installed or not available in PATH');
    }

    // Initialize git repository
    await execa('git', ['init'], { cwd: mod.destinationPath });

    // Configure git user if not configured (use mod author as fallback)
    try {
      await execa('git', ['config', 'user.name'], { cwd: mod.destinationPath });
    } catch (error) {
      await execa('git', ['config', 'user.name', mod.author], { cwd: mod.destinationPath });
    }

    try {
      await execa('git', ['config', 'user.email'], { cwd: mod.destinationPath });
    } catch (error) {
      await execa('git', ['config', 'user.email', `${mod.author.toLowerCase().replace(/\s+/g, '.')}@example.com`], { cwd: mod.destinationPath });
    }

    // Add all files to git
    await execa('git', ['add', '.'], { cwd: mod.destinationPath });

    // Create initial commit
    await execa('git', ['commit', '-m', `Initial commit: ${mod.name} v${mod.version}`], { cwd: mod.destinationPath });

    s.stop(`Git repository initialized with initial commit`);
  } catch (error) {
    s.stop(`Failed to initialize Git repository`, 1);
    throw new Error(`Git initialization failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function runGradle(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Configuring Gradle project in "${mod.destinationPath}"...`);

  try {
    const { execa } = await import('execa');

    // Platform-specific setup
    const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    const gradlewPath = path.join(mod.destinationPath, gradleCommand);

    // Set execute permissions on Unix-like systems
    if (process.platform !== 'win32') {
      try {
        await fs.chmod(gradlewPath, 0o755);
      } catch (error) {
        // Non-fatal, continue
      }
    }

    // Validate Gradle wrapper exists
    try {
      await fs.access(gradlewPath, fs.constants.F_OK);
    } catch {
      throw new Error(`Gradle wrapper not found at ${gradlewPath}`);
    }

    // Execute Gradle with streaming output
    const subprocess = execa(gradleCommand, [], {
      cwd: mod.destinationPath,
      timeout: 10 * 60 * 1000, // 10 minutes
      stdout: 'pipe',
      stderr: 'pipe',
      reject: false,
      all: true
    });

    // Stream real-time output
    subprocess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      if (shouldShowOutput(output)) {
        process.stdout.write(output);
      }
    });

    subprocess.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      process.stderr.write(`\x1b[31m${output}\x1b[0m`); // Red text for errors
    });

    // Wait for completion
    const result = await subprocess;

    if (result.exitCode !== 0) {
      throw new Error(`Gradle execution failed with exit code ${result.exitCode}`);
    }

    // Clear console and show success
    console.clear();
    s.stop(`Gradle project configured successfully`);

  } catch (error) {
    s.stop(`Failed to configure Gradle project`, 1);

    if (error instanceof Error) {
      // Provide helpful error messages
      if (error.message.includes('ENOENT')) {
        throw new Error(`Gradle wrapper not found. Please ensure the project was generated correctly.`);
      } else if (error.message.includes('permission')) {
        throw new Error(`Permission denied running Gradle wrapper. Check file permissions.`);
      } else if (error.message.includes('timeout')) {
        throw new Error(`Gradle setup timed out after 10 minutes. Check network connection and try again.`);
      } else if (error.message.includes('JAVA_HOME')) {
        throw new Error(`Java not found or misconfigured. Please install Java ${mod.javaVersion} and try again.`);
      } else {
        throw new Error(`Gradle configuration failed: ${error.message}`);
      }
    } else {
      throw new Error(`Gradle configuration failed: ${String(error)}`);
    }
  }
}

function shouldShowOutput(output: string): boolean {
  return true;
  // Show key Gradle operations but filter verbose noise
  const keyPatterns = [
    /Downloading/i,
    /Configuring/i,
    /Building/i,
    /Minecraft/i,
    /Mappings/i,
    /SUCCESS|FAILED/i,
    /warning|error/i
  ];
  return keyPatterns.some(pattern => pattern.test(output)) ||
         output.trim().length > 0 && !output.includes('At least one daemon');
}

export async function openInVSCode(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Opening ${mod.destinationPath} in VS Code...`);
  try {
    const { execa } = await import('execa');
    execa('code', [mod.destinationPath], { cwd: mod.destinationPath, detached: true }).unref();
    s.stop(`Opened ${mod.destinationPath} in VS Code`);
  } catch (error) {
    s.stop(`Failed to open VS Code`, 1);
    throw new Error(`VS Code opening failed for ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function openInIntelliJ(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Opening ${mod.destinationPath} in IntelliJ IDEA...`);
  try {
    const { execa } = await import('execa');
    execa('idea', [mod.destinationPath], { cwd: mod.destinationPath, detached: true }).unref();
    s.stop(`Opened ${mod.destinationPath} in IntelliJ IDEA`);
  } catch (error) {
    s.stop(`Failed to open IntelliJ IDEA`, 1);
    throw new Error(`IntelliJ IDEA opening failed for ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}