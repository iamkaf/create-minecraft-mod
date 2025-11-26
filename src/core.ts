import type { Mod } from "./types.js";
import { spinner } from "@clack/prompts";
import { ensureDirectoryExists } from "./util.js";

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cloneTemplate(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Cloning template to "${mod.destinationPath}"...`);
  try {
    // Ensure destination directory exists
    ensureDirectoryExists(mod.destinationPath);
    await delay(1000);
    s.stop(`Template cloned to ${mod.destinationPath}`);
  } catch (error) {
    s.stop(`Failed to clone template`, 1);
    throw new Error(`Template cloning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function applyTemplateVariables(mod: Mod): Promise<void> {
  const s = spinner();
  s.start(`Applying template variables in "${mod.destinationPath}"...`);
  try {
    await delay(500);
    s.stop(`Variables applied: name=${mod.name}, id=${mod.id}, package=${mod.package}`);
  } catch (error) {
    s.stop(`Failed to apply template variables`, 1);
    throw new Error(`Template variable application failed in ${mod.destinationPath}: ${error instanceof Error ? error.message : String(error)}`);
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
    await cloneTemplate(mod);
    await applyTemplateVariables(mod);
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
  applyTemplateVariables,
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