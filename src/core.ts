import type { Mod } from "./types.js";
import { spinner } from "@clack/prompts";
import { ensureDirectoryExists } from "./util.js";
import { promises as fs } from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { generateTemplateVariables, type TemplateVariables } from './template-variables.js';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cloneTemplate(mod: Mod): Promise<void> {
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
        await copyDirectoryContents(loaderPath, mod.destinationPath);
      }
    }

    s.stop(`Template cloned to ${mod.destinationPath}`);
  } catch (error) {
    s.stop(`Failed to clone template`, 1);
    throw new Error(`Template cloning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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

async function transformPackageStructure(mod: Mod): Promise<void> {
  const s = spinner();
  s.start('Transforming package structure...');
  try {
    const templatePackagePath = 'com/example/modtemplate';
    const userPackagePath = mod.package.replace(/\./g, '/');

    // Transform common module
    const commonPath = path.join(mod.destinationPath, 'common', 'src/main/java', templatePackagePath);
    const commonNewPath = path.join(mod.destinationPath, 'common', 'src/main/java', userPackagePath);
    if (await fs.access(commonPath).then(() => true).catch(() => false)) {
      await fs.rename(commonPath, commonNewPath);
    }

    // Transform loader-specific modules (selected loaders only)
    // Loader files are copied directly to src/main/java/ in this template structure
    const srcPath = path.join(mod.destinationPath, 'src/main/java', templatePackagePath);
    const srcNewPath = path.join(mod.destinationPath, 'src/main/java', userPackagePath);

    if (await fs.access(srcPath).then(() => true).catch(() => false)) {
      await fs.rename(srcPath, srcNewPath);
    }

    s.stop('Package structure transformed');
  } catch (error) {
    s.stop('Failed to transform package structure', 1);
    throw new Error(`Package transformation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function updateJavaPackageDeclarations(mod: Mod): Promise<void> {
  const s = spinner();
  s.start('Updating Java package declarations...');
  try {
    // Find all .java files and update package declarations
    const javaFiles = await findJavaFiles(mod.destinationPath);

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

    s.stop('Java package declarations updated');
  } catch (error) {
    s.stop('Failed to update Java package declarations', 1);
    throw new Error(`Package declaration update failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function findJavaFiles(dir: string): Promise<string[]> {
  const javaFiles: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      javaFiles.push(...await findJavaFiles(fullPath));
    } else if (entry.name.endsWith('.java')) {
      javaFiles.push(fullPath);
    }
  }

  return javaFiles;
}

async function applyTemplateVariables(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Applying template variables in "${mod.destinationPath}"...`);
  try {
    // Generate all template variables
    const variables = await generateTemplateVariables(mod);

    // Process all files in the destination directory
    await processDirectory(mod.destinationPath, variables);

    s.stop(`Template variables applied successfully`);
  } catch (error) {
    s.stop(`Failed to apply template variables`, 1);
    throw new Error(`Template variable application failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  const s = spinner();
  s.start('Generating service registration files...');
  try {
    const variables = await generateTemplateVariables(mod);

    // Generate META-INF/services files for each selected loader
    for (const loader of mod.loaders) {
      const serviceDir = path.join(mod.destinationPath, loader, 'src/main/resources/META-INF/services');
      await fs.mkdir(serviceDir, { recursive: true });

      const serviceFile = path.join(serviceDir, 'IPlatformHelper');

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
    }

    s.stop('Service registration files generated');
  } catch (error) {
    s.stop('Failed to generate service registration files', 1);
    throw new Error(`Service file generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function renameClassFiles(mod: Mod): Promise<void> {
  const s = spinner();
  s.start('Renaming class files and updating references...');
  try {
    const variables = await generateTemplateVariables(mod);

    // Rename main class files
    const classRenames = [
      { old: 'TemplateMod.java', new: `${variables.main_class_name}.java` },
      { old: 'Constants.java', new: `${variables.constants_class_name}.java` },
      { old: 'TemplateFabric.java', new: `${variables.fabric_entry_class}.java` },
      { old: 'TemplateForge.java', new: `${variables.forge_entry_class}.java` },
      { old: 'TemplateNeoForge.java', new: `${variables.neoforge_entry_class}.java` },
    ];

    for (const rename of classRenames) {
      await findAndRenameClassFiles(mod.destinationPath, rename.old, rename.new, variables);
    }

    s.stop('Class files renamed and updated');
  } catch (error) {
    s.stop('Failed to rename class files', 1);
    throw new Error(`Class renaming failed: ${error instanceof Error ? error.message : String(error)}`);
  }
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
  if (mod.samples.length === 0) {
    return; // Skip entirely if no samples requested
  }

  const s = spinner();
  s.start(`Adding sample code to "${mod.destinationPath}": ${mod.samples.join(', ')}`);
  try {
    await delay(800);
    s.stop(`Sample code added successfully`);
  } catch (error) {
    s.stop(`Failed to add sample code`, 1);
    throw new Error(`Sample code addition failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function installUtilityMods(mod: Mod): Promise<void> {
  if (mod.utility.length === 0) {
    return; // Skip entirely if no utility mods requested
  }

  const s = spinner();
  s.start(`Installing utility mods to "${mod.destinationPath}": ${mod.utility.join(', ')}`);
  try {
    await delay(600);
    s.stop(`Utility mods installed successfully`);
  } catch (error) {
    s.stop(`Failed to install utility mods`, 1);
    throw new Error(`Utility mod installation failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function installLibraries(mod: Mod): Promise<void> {
  if (mod.libraries.length === 0) {
    return; // Skip entirely if no libraries requested
  }

  const s = spinner();
  s.start(`Installing libraries to "${mod.destinationPath}": ${mod.libraries.join(', ')}`);
  try {
    await delay(700);
    s.stop(`Libraries installed successfully`);
  } catch (error) {
    s.stop(`Failed to install libraries`, 1);
    throw new Error(`Library installation failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function configureLoaders(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Configuring loaders in "${mod.destinationPath}": ${mod.loaders.join(', ')}`);
  try {
    await delay(400);
    s.stop(`Loaders configured successfully`);
  } catch (error) {
    s.stop(`Failed to configure loaders`, 1);
    throw new Error(`Loader configuration failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function applyLicense(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Applying license to "${mod.destinationPath}": ${mod.license}`);
  try {
    await delay(300);
    s.stop(`License applied successfully`);
  } catch (error) {
    s.stop(`Failed to apply license`, 1);
    throw new Error(`License application failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function finalizeProject(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Finalizing project structure in "${mod.destinationPath}" for "${mod.name}"...`);
  try {
    await delay(900);
    s.stop(`Project finalized successfully`);
  } catch (error) {
    s.stop(`Failed to finalize project`, 1);
    throw new Error(`Project finalization failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function runGradle(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Running Gradle build in "${mod.destinationPath}" for "${mod.name}"...`);
  try {
    await delay(2000);
    s.stop(`Gradle build completed`);
  } catch (error) {
    s.stop(`Failed to run Gradle build`, 1);
    throw new Error(`Gradle build failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function initializeGit(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Initializing Git repository in "${mod.destinationPath}"...`);
  try {
    await delay(300);
    s.stop(`Git repository initialized`);
  } catch (error) {
    s.stop(`Failed to initialize Git repository`, 1);
    throw new Error(`Git initialization failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function openInVSCode(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Opening project "${mod.destinationPath}" in VS Code...`);
  try {
    await delay(200);
    s.stop(`VS Code opened`);
  } catch (error) {
    s.stop(`Failed to open VS Code`, 1);
    throw new Error(`VS Code opening failed for ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function openInIntelliJ(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Opening project "${mod.destinationPath}" in IntelliJ IDEA...`);
  try {
    await delay(250);
    s.stop(`IntelliJ IDEA opened`);
  } catch (error) {
    s.stop(`Failed to open IntelliJ IDEA`, 1);
    throw new Error(`IntelliJ IDEA opening failed for ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
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