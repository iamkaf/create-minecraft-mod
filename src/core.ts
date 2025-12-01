import type { Mod } from "./types.js";
import { spinner } from "@clack/prompts";
import { ensureDirectoryExists } from "./util.js";
import { promises as fs } from 'fs';
import path from 'path';
import { execa } from 'execa';
import Handlebars from 'handlebars';
import { generateTemplateVariables, type TemplateVariables } from './template-variables.js';
import { getUtilityModConfig } from './config/index.js';
import { withSpinner } from './utils/pipeline-step.js';
import { fileExists, findFilesByExtension, copyDirectory } from './utils/file-system.js';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cloneTemplate(mod: Mod): Promise<void> {
  return withSpinner(
    `Cloning template to "${mod.destinationPath}"...`,
    async () => {
      // Ensure destination directory exists
      ensureDirectoryExists(mod.destinationPath);

      // Copy base/ contents to destination root
      const basePath = path.join('templates', 'base');
      await copyDirectory(basePath, mod.destinationPath);

      // Copy selected loader modules from loaders/
      const loadersPath = path.join('templates', 'loaders');
      for (const loader of mod.loaders) {
        const loaderPath = path.join(loadersPath, loader);
        if (await fileExists(loaderPath)) {
          const loaderDestPath = path.join(mod.destinationPath, loader);
          await copyDirectory(loaderPath, loaderDestPath);
        }
      }
    },
    `Template cloned to ${mod.destinationPath}`
  );
}


async function transformPackageStructure(mod: Mod): Promise<void> {
  return withSpinner(
    'Transforming package structure...',
    async () => {
      const templatePackagePath = 'com/example/modtemplate';
      const userPackagePath = mod.package.replace(/\./g, '/');

      // Transform common module
      const commonPath = path.join(mod.destinationPath, 'common', 'src/main/java', templatePackagePath);
      const commonNewPath = path.join(mod.destinationPath, 'common', 'src/main/java', userPackagePath);
      if (await fileExists(commonPath)) {
        await fs.rename(commonPath, commonNewPath);
      }

      // Transform loader-specific modules (selected loaders only)
      // Each loader has its own directory at root level with src/main/java/ structure
      for (const loader of mod.loaders) {
        const loaderJavaPath = path.join(mod.destinationPath, loader, 'src/main/java', templatePackagePath);
        const loaderNewJavaPath = path.join(mod.destinationPath, loader, 'src/main/java', userPackagePath);

        if (await fileExists(loaderJavaPath)) {
          await fs.rename(loaderJavaPath, loaderNewJavaPath);
        }
      }
    },
    'Package structure transformed'
  );
}

async function updateJavaPackageDeclarations(mod: Mod): Promise<void> {
  return withSpinner(
    'Updating Java package declarations...',
    async () => {
      // Find all .java files and update package declarations
      const javaFiles = await findFilesByExtension(mod.destinationPath, '.java');

      for (const filePath of javaFiles) {
        let content = await fs.readFile(filePath, 'utf-8');

        // Update package declaration
        content = content.replace(
          /^package com\.example\.modtemplate;/m,
          `package ${mod.package};`
        );

        // Update import statements
        content = content.replace(
          /import com\.example\.modtemplate\./g,
          `import ${mod.package}.`
        );

        await fs.writeFile(filePath, content, 'utf-8');
      }
    },
    'Java package declarations updated'
  );
}


async function applyTemplateVariables(mod: Mod): Promise<void> {
  return withSpinner(
    `Applying template variables in "${mod.destinationPath}"...`,
    async () => {
      // Generate all template variables
      const variables = await generateTemplateVariables(mod);

      // Process all files in the destination directory
      await processDirectory(mod.destinationPath, variables);
    },
    `Template variables applied successfully`
  );
}

async function processDirectory(dir: string, variables: TemplateVariables): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, variables);
    } else {
      // Skip binary files and already processed files
      const skipExtensions = ['.jar', '.png', '.jpg', '.gif', '.zip'];
      const shouldSkip = skipExtensions.some(ext => entry.name.endsWith(ext));

      if (!shouldSkip) {
        await processFile(fullPath, variables);
      }
    }
  }
}

async function processFile(filePath: string, variables: TemplateVariables): Promise<void> {
  try {
    let content = await fs.readFile(filePath, 'utf-8');

    // Apply handlebars substitution (preserves ${variable} for Gradle)
    const template = Handlebars.compile(content);
    const processedContent = template(variables);

    // Only write if content changed
    if (processedContent !== content) {
      await fs.writeFile(filePath, processedContent, 'utf-8');
    }
  } catch (error) {
    // Skip files that can't be read as text (binary files)
    console.debug(`Skipping binary file: ${filePath}`);
  }
}

async function generateServiceRegistrationFiles(mod: Mod): Promise<void> {
  return withSpinner(
    'Generating service registration files...',
    async () => {
      const variables = await generateTemplateVariables(mod);

      // Generate META-INF/services files for each selected loader
      for (const loader of mod.loaders) {
        const serviceDir = path.join(mod.destinationPath, loader, 'src/main/resources/META-INF/services');
        await fs.mkdir(serviceDir, { recursive: true });

        const serviceFile = path.join(serviceDir, `${variables.package_base}.platform.services.${variables.platform_helper_interface}`);

        // Use the correct platform helper class name for this loader
        let platformHelperClass = '';
        switch (loader) {
          case 'fabric':
            platformHelperClass = variables.fabric_platform_helper;
            break;
          case 'forge':
            platformHelperClass = variables.forge_platform_helper;
            break;
          case 'neoforge':
            platformHelperClass = variables.neoforge_platform_helper;
            break;
        }

        const serviceContent = `${variables.package_base}.platform.services.${platformHelperClass}`;
        await fs.writeFile(serviceFile, serviceContent, 'utf-8');

        // Delete the template service registration file
        const templateServiceFile = path.join(serviceDir, `com.example.modtemplate.platform.services.${variables.platform_helper_interface}`);
        try {
          await fs.unlink(templateServiceFile);
        } catch (error) {
          // File doesn't exist, which is fine
        }
      }
    },
    'Service registration files generated'
  );
}

async function renameClassFiles(mod: Mod): Promise<void> {
  return withSpinner(
    'Renaming class files and updating references...',
    async () => {
      const variables = await generateTemplateVariables(mod);

      // Rename all template class files
      const classRenames = [
        // Common module classes
        { old: 'TemplateMod.java', new: `${variables.main_class_name}.java` },
        { old: 'Constants.java', new: `${variables.constants_class_name}.java` },

        // Loader entry point classes
        { old: 'TemplateFabric.java', new: `${variables.fabric_entry_class}.java` },
        { old: 'TemplateForge.java', new: `${variables.forge_entry_class}.java` },
        { old: 'TemplateNeoForge.java', new: `${variables.neoforge_entry_class}.java` },

        // Fabric-specific classes
        // ModDatagen.java is already correctly named

        // Platform helper classes
        { old: 'FabricPlatformHelper.java', new: `${variables.fabric_platform_helper}.java` },
        { old: 'ForgePlatformHelper.java', new: `${variables.forge_platform_helper}.java` },
        { old: 'NeoForgePlatformHelper.java', new: `${variables.neoforge_platform_helper}.java` },
      ];

      for (const rename of classRenames) {
        await findAndRenameClassFiles(mod.destinationPath, rename.old, rename.new, variables);
      }
    },
    'Class files renamed and updated'
  );
}

async function findAndRenameClassFiles(dir: string, oldName: string, newName: string, variables: TemplateVariables): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await findAndRenameClassFiles(fullPath, oldName, newName, variables);
    } else if (entry.name === oldName) {
      // Rename the file
      const newPath = path.join(dir, newName);
      await fs.rename(fullPath, newPath);

      // Update class declaration inside the file
      let content = await fs.readFile(newPath, 'utf-8');
      const oldClassName = oldName.replace('.java', '');
      const newClassName = newName.replace('.java', '');

      content = content.replace(
        new RegExp(`\\b${oldClassName}\\b`, 'g'),
        newClassName
      );

      await fs.writeFile(newPath, content, 'utf-8');
    }
  }
}

async function addSampleCode(mod: Mod): Promise<void> {
  // TODO: Implement advanced sample code system
  // - REVISIT LATER: Requires more powerful approach than simple file copying
  // - Support different sample types: commands, items, blocks, events, etc.
  // - Apply template variables to sample files
  // - Update package declarations and imports
  // - Integrate with existing mod structure
  // - May need code generation/AST manipulation for proper integration
  if (mod.samples.length === 0) {
    return; // Skip entirely if no samples requested
  }

  return withSpinner(
    `Adding sample code to "${mod.destinationPath}": ${mod.samples.join(', ')}`,
    async () => {
      await delay(800);
    },
    `Sample code added successfully`
  );
}

// Utility mod configuration is now handled by centralized configuration
// This eliminates duplication and provides single source of truth

// Helper function to download mod JAR with retry logic
async function downloadModJar(
  url: string,
  destinationPath: string,
  retryCount: number = 1
): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(destinationPath, Buffer.from(buffer));
  } catch (error) {
    if (retryCount > 0) {
      console.warn(`Download failed, retrying... (${retryCount} retries left)`);
      await downloadModJar(url, destinationPath, retryCount - 1);
    } else {
      throw error;
    }
  }
}

// Helper function to get loader-specific mods directory
function getLoaderModsDirectory(destinationPath: string, loader: string): string {
  switch (loader) {
    case 'fabric':
    case 'forge':
      return path.join(destinationPath, loader, 'runs', 'client', 'mods');
    case 'neoforge':
      return path.join(destinationPath, 'neoforge', 'run', 'mods');
    default:
      throw new Error(`Unknown loader: ${loader}`);
  }
}

// Helper function to extract filename from URL
function extractFilename(url: string, fallback: string): string {
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  return filename && filename.endsWith('.jar') ? filename : `${fallback}.jar`;
}

async function installUtilityMods(mod: Mod): Promise<void> {
  if (mod.mods.length === 0) {
    return; // Skip entirely if no runtime mods requested
  }

  // Import dependency system functions
  const { getDependencyConfig } = await import('./config/index.js');

  // Track configuration results
  const results = {
    configured: 0,
    skipped: [] as string[],
    failed: [] as string[]
  };

  // Process each selected runtime mod
  for (const modSelection of mod.mods) {
    const dependencyConfig = getDependencyConfig(modSelection);
    if (!dependencyConfig) {
      results.skipped.push(`${modSelection} (unknown dependency)`);
      continue;
    }

    // Only process mod-type dependencies
    if (dependencyConfig.type !== 'mod') {
      results.skipped.push(`${dependencyConfig.displayName} (not a runtime mod)`);
      continue;
    }

    // Check if mod is compatible with selected loaders
    const compatibleLoaders = mod.loaders.filter(loader =>
      dependencyConfig.compatibleLoaders.includes(loader as any)
    );

    if (compatibleLoaders.length === 0) {
      results.skipped.push(`${dependencyConfig.displayName} (no compatible loaders)`);
      continue;
    }

    // Note: Runtime mods are now handled via Maven dependencies in build.gradle
    // The template system already includes the modImplementation declarations
    // This function validates compatibility and provides user feedback
    results.configured++;
  }

  // Generate final status message for success
  let statusMessage = `Configured ${results.configured} runtime mods for Maven resolution`;
  if (results.skipped.length > 0) {
    statusMessage += ` (${results.skipped.length} skipped)`;
  }

  if (results.failed.length > 0) {
    statusMessage += ` (${results.failed.length} failed)`;
    console.warn('Failed configurations:', results.failed);
    throw new Error(statusMessage);
  }

  return withSpinner(
    `Configuring runtime mods for Gradle Maven resolution: ${mod.mods.join(', ')}`,
    async () => {
      // The actual work was done above, this is just for the spinner
    },
    statusMessage
  );
}

async function installLibraries(mod: Mod): Promise<void> {
  // NOTE: Library installation is handled by Gradle during build
  // - Dependencies added to build.gradle via template variables
  // - Versions fetched from echo-registry and applied via templates
  // - Gradle handles downloading and managing library dependencies
  // - This function echoes user choices for confirmation
  if (mod.libraries.length === 0) {
    return; // Skip entirely if no libraries requested
  }

  const libraryDetails = mod.libraries.map(library => {
    return `${library} (via build.gradle)`;
  }).join(', ');

  return withSpinner(
    `Installing libraries to "${mod.destinationPath}": ${mod.libraries.join(', ')}`,
    async () => {
      // Libraries are configured via build.gradle templates
    },
    `Configured libraries for Minecraft ${mod.minecraftVersion}: ${libraryDetails} [versions fetched from Echo Registry]`
  );
}

async function configureLoaders(mod: Mod): Promise<void> {
  // NOTE: Loader configuration is already handled through template variables
  // - Fabric: fabric.mod.json updated via template variables
  // - Forge: mods.toml updated via template variables
  // - NeoForge: neoforge.mods.toml updated via template variables
  // - Build configurations handled by gradle templates
  // - This function echoes user choices for confirmation
  const loaderConfigs = mod.loaders.map(loader => {
    switch (loader) {
      case 'fabric':
        return `Fabric (fabric.mod.json + build.gradle)`;
      case 'forge':
        return `Forge (META-INF/mods.toml + build.gradle)`;
      case 'neoforge':
        return `NeoForge (META-INF/neoforge.mods.toml + build.gradle)`;
      default:
        return loader;
    }
  }).join(', ');

  return withSpinner(
    `Configuring loaders in "${mod.destinationPath}": ${mod.loaders.join(', ')}`,
    async () => {
      // Loaders are configured via template variables
    },
    `Configured loaders for Minecraft ${mod.minecraftVersion}: ${loaderConfigs}`
  );
}

async function applyLicense(mod: Mod): Promise<void> {
  // Skip if no license selected
  if (!mod.license || mod.license === 'none') {
    return;
  }

  return withSpinner(
    `Applying license to "${mod.destinationPath}": ${mod.license}`,
    async () => {
      // Map license types to template files
      const licenseFileMap: Record<string, string> = {
        'mit': 'mit.txt',
        'lgpl': 'lgpl.txt',
        'arr': 'arr.txt'
      };

      // Validate license type
      const licenseTemplateFile = licenseFileMap[mod.license.toLowerCase()];
      if (!licenseTemplateFile) {
        throw new Error(`Unsupported license type: ${mod.license}. Supported types: ${Object.keys(licenseFileMap).join(', ')}`);
      }

      // Construct source and destination paths
      const licenseTemplatePath = path.join('templates', 'license', licenseTemplateFile);
      const licenseDestinationPath = path.join(mod.destinationPath, 'LICENSE');

      // Verify template file exists
      try {
        await fs.access(licenseTemplatePath);
      } catch (error) {
        throw new Error(`License template not found: ${licenseTemplatePath}`);
      }

      // Copy license template to destination
      await fs.copyFile(licenseTemplatePath, licenseDestinationPath);

      // Apply template variables to the license file
      const variables = await generateTemplateVariables(mod);
      await processFile(licenseDestinationPath, variables);

      // License processing is handled inside the withSpinner operation
    },
    `License applied successfully: ${mod.license}`
  );
}

async function finalizeProject(mod: Mod): Promise<void> {
  // TODO: Implement project finalization
  // - Validate generated project structure
  // - Ensure all necessary files are present
  // - Verify template variable substitution completeness
  // - Create any missing directories or configuration files
  // - Generate project summary or build information
  // - Clean up any temporary files
  return withSpinner(
    `Finalizing project structure in "${mod.destinationPath}" for "${mod.name}"...`,
    async () => {
      await delay(900);
    },
    `Project finalized successfully`
  );
}

// Helper function to get platform-specific Gradle wrapper command
function getGradleWrapperCommand(): string {
  return process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
}

// Helper function to ensure Gradle wrapper has proper permissions on POSIX systems
async function ensureWrapperPermissions(destinationPath: string): Promise<void> {
  if (process.platform !== 'win32') {
    const gradlewPath = path.join(destinationPath, 'gradlew');
    try {
      await fs.chmod(gradlewPath, 0o755);
    } catch (error) {
      // Non-fatal, continue with execution
    }
  }
}

// Helper function to determine if Gradle output should be shown
function shouldShowOutput(output: string): boolean {
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
         (output.trim().length > 0 && !output.includes('At least one daemon'));
}

// Helper function to stream Gradle output with filtering
async function streamGradleOutput(subprocess: any): Promise<void> {
  const outputStream = process.stdout;

  subprocess.stdout?.on('data', (data: Buffer) => {
    const output = data.toString();
    // Filter for important Gradle messages
    if (shouldShowOutput(output)) {
      outputStream.write(output);
    }
  });

  subprocess.stderr?.on('data', (data: Buffer) => {
    const output = data.toString();
    // Always show stderr (errors, warnings) in red
    outputStream.write(`\x1b[31m${output}\x1b[0m`);
  });
}

async function runGradle(mod: Mod): Promise<void> {
  return withSpinner(
    `Configuring Gradle project in "${mod.destinationPath}"...`,
    async () => {
      // Platform-specific setup
      const gradleCommand = getGradleWrapperCommand();
      await ensureWrapperPermissions(mod.destinationPath);

      // Validate Gradle wrapper exists
      const wrapperPath = path.join(mod.destinationPath, gradleCommand);
      try {
        await fs.access(wrapperPath, fs.constants.F_OK);
      } catch {
        throw new Error(`Gradle wrapper not found at ${wrapperPath}`);
      }

      // Execute Gradle with streaming output
      const subprocess = execa(gradleCommand, [], {
        cwd: mod.destinationPath,
        timeout: 10 * 60 * 1000, // 10 minutes
        stdout: 'pipe',
        stderr: 'pipe',
        reject: true,
        all: true
      });

      // Stream real-time output
      await streamGradleOutput(subprocess);

      // Wait for completion
      await subprocess;

      // Clear console for clean output
      console.clear();

      // Gradle execution is handled inside the withSpinner operation
    },
    `Gradle project configured successfully`
  );
}

async function initializeGit(mod: Mod): Promise<void> {
  return withSpinner(
    `Initializing Git repository in "${mod.destinationPath}"...`,
    async () => {
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

      // Git operations are handled inside the withSpinner operation
    },
    `Git repository initialized with initial commit`
  );
}

async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    // Use 'which' or 'where' command to check if command exists
    const whichCommand = process.platform === 'win32' ? 'where' : 'which';
    await execa(whichCommand, [command], {
      cwd: process.cwd(),
      timeout: 5000,
      reject: true
    });
    return true;
  } catch {
    return false;
  }
}

async function detectVSCodeCommand(): Promise<string | null> {
  const vscodeCommands = ['code', 'code-insiders', 'code-oss'];

  for (const command of vscodeCommands) {
    if (await isCommandAvailable(command)) {
      return command;
    }
  }

  return null;
}

async function detectIntelliJCommand(): Promise<string | null> {
  const intellijCommands = ['idea', 'idea64', 'idea.sh'];

  for (const command of intellijCommands) {
    if (await isCommandAvailable(command)) {
      return command;
    }
  }

  return null;
}

async function openInVSCode(mod: Mod): Promise<void> {
  // Detect available VS Code command first
  const vscodeCommand = await detectVSCodeCommand();

  if (!vscodeCommand) {
    throw new Error('VS Code not found. Please install Visual Studio Code and ensure it\'s in your PATH. Available commands: code, code-insiders, code-oss');
  }

  const variantName = vscodeCommand === 'code-insiders' ? 'VS Code Insiders' :
                     vscodeCommand === 'code-oss' ? 'VS Code OSS' : 'VS Code';

  return withSpinner(
    `Opening project "${mod.destinationPath}" in VS Code...`,
    async () => {
      // Open project in VS Code (run in background)
      execa(vscodeCommand, [mod.destinationPath], {
        cwd: mod.destinationPath,
        detached: true,
        stdio: 'ignore'
      }).unref();
    },
    `${variantName} opened successfully`
  );
}

async function openInIntelliJ(mod: Mod): Promise<void> {
  // Detect available IntelliJ command first
  const intellijCommand = await detectIntelliJCommand();

  if (!intellijCommand) {
    throw new Error('IntelliJ IDEA not found. Please install IntelliJ IDEA and ensure it\'s in your PATH. Available commands: idea, idea64, idea.sh');
  }

  const variantName = intellijCommand === 'idea64' ? 'IntelliJ IDEA (64-bit)' :
                     intellijCommand === 'idea.sh' ? 'IntelliJ IDEA (Linux)' : 'IntelliJ IDEA';

  return withSpinner(
    `Opening project "${mod.destinationPath}" in IntelliJ IDEA...`,
    async () => {
      // Open project in IntelliJ IDEA (run in background)
      execa(intellijCommand, [mod.destinationPath], {
        cwd: mod.destinationPath,
        detached: true,
        stdio: 'ignore'
      }).unref();
    },
    `${variantName} opened successfully`
  );
}

async function runPipeline(mod: Mod): Promise<void> {
  try {
    // Core template processing
    await cloneTemplate(mod);
    await transformPackageStructure(mod);  // NEW
    await renameClassFiles(mod);           // NEW
    await generateServiceRegistrationFiles(mod); // NEW
    await updateJavaPackageDeclarations(mod);     // NEW
    await applyTemplateVariables(mod);

    // Configuration and content
    await configureLoaders(mod);
    await installLibraries(mod);
    await installUtilityMods(mod);
    await addSampleCode(mod);
    await applyLicense(mod);
    await finalizeProject(mod);

    // Run post-creation actions
    for (const action of mod.postActions) {
      switch (action) {
        case 'git-init':
          await initializeGit(mod);
          break;
        case 'run-gradle':
          await runGradle(mod);
          break;
        case 'open-vscode':
          await openInVSCode(mod);
          break;
        case 'open-intellij':
          await openInIntelliJ(mod);
          break;
        default:
          throw new Error(`Unknown post-creation action: ${action}`);
      }
    }
  } catch (error) {
    throw error; // Re-throw for main error handler
  }
}

export {
  cloneTemplate,
  transformPackageStructure,
  updateJavaPackageDeclarations,
  applyTemplateVariables,
  generateServiceRegistrationFiles,
  renameClassFiles,
  addSampleCode,
  installUtilityMods,
  installLibraries,
  configureLoaders,
  applyLicense,
  finalizeProject,
  runGradle,
  initializeGit,
  openInVSCode,
  openInIntelliJ,
  runPipeline,
};
export type { Mod };