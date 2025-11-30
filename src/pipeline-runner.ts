import type { Mod } from './types.js';
import { spinner } from "@clack/prompts";
import * as pipeline from './pipeline.js';

/**
 * Pipeline execution options
 */
export interface PipelineOptions {
  skipGradle?: boolean;
  skipGit?: boolean;
  skipIde?: boolean;
  onProgress?: (step: string, progress: number) => void;
  silent?: boolean;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  success: boolean;
  duration: number;
  steps: PipelineStepResult[];
  error?: string;
}

export interface PipelineStepResult {
  step: string;
  success: boolean;
  duration: number;
  error?: string;
}

/**
 * Mode-agnostic pipeline execution engine
 * This provides consistent behavior across interactive, headless, and config modes
 */
export class PipelineRunner {
  private startTime: number = 0;
  private steps: PipelineStepResult[] = [];

  /**
   * Execute the complete mod creation pipeline
   */
  async runPipeline(mod: Mod, options: PipelineOptions = {}): Promise<PipelineResult> {
    this.startTime = Date.now();
    this.steps = [];

    try {
      if (!options.silent) {
        const s = spinner();
        s.start(`Creating Minecraft mod "${mod.name}"...`);
      }

      // Core template processing
      await this.runStep('template-clone', () => pipeline.cloneTemplate(mod), options);
      await this.runStep('package-transform', () => pipeline.transformPackageStructure(mod), options);
      await this.runStep('class-rename', () => pipeline.renameClassFiles(mod), options);
      await this.runStep('mixin-rename', () => pipeline.renameMixinFiles(mod), options);
      await this.runStep('service-reg', () => pipeline.generateServiceRegistrationFiles(mod), options);
      await this.runStep('template-vars', () => pipeline.applyTemplateVariables(mod), options);

      // Configuration and content
      await this.runStep('configure-loaders', () => pipeline.configureLoaders(mod), options);
      await this.runStep('install-libraries', () => pipeline.installLibraries(mod), options);
      await this.runStep('install-utility', () => pipeline.installUtilityMods(mod), options);
      await this.runStep('add-samples', () => pipeline.addSampleCode(mod), options);
      await this.runStep('apply-license', () => pipeline.applyLicense(mod), options);
      await this.runStep('finalize-project', () => pipeline.finalizeProject(mod), options);

      // Run post-creation actions
      if (mod.postActions.length > 0) {
        for (const action of mod.postActions) {
          switch (action) {
            case 'git-init':
              if (!options.skipGit) {
                await this.runStep('git-init', () => pipeline.initializeGit(mod), options);
              }
              break;
            case 'run-gradle':
              if (!options.skipGradle) {
                await this.runStep('run-gradle', () => pipeline.runGradle(mod), options);
              }
              break;
            case 'open-vscode':
              if (!options.skipIde) {
                await this.runStep('open-vscode', () => pipeline.openInVSCode(mod), options);
              }
              break;
            case 'open-intellij':
              if (!options.skipIde) {
                await this.runStep('open-intellij', () => pipeline.openInIntelliJ(mod), options);
              }
              break;
            default:
              throw new Error(`Unknown post-creation action: ${action}`);
          }
        }
      }

      if (!options.silent) {
        const s = spinner();
        s.stop(`Successfully created Minecraft mod "${mod.name}"`);
      }

      const duration = Date.now() - this.startTime;
      return {
        success: true,
        duration,
        steps: this.steps
      };

    } catch (error) {
      const duration = Date.now() - this.startTime;
      return {
        success: false,
        duration,
        steps: this.steps,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute a single pipeline step with error handling and timing
   */
  private async runStep(
    stepName: string,
    stepFunction: () => Promise<void>,
    options: PipelineOptions
  ): Promise<void> {
    const startTime = Date.now();

    if (options.onProgress) {
      options.onProgress(stepName, this.steps.length);
    }

    try {
      await stepFunction();
      const duration = Date.now() - startTime;

      this.steps.push({
        step: stepName,
        success: true,
        duration
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      this.steps.push({
        step: stepName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error; // Re-throw to stop pipeline execution
    }
  }

  /**
   * Get progress information for the current pipeline execution
   */
  getProgress(): { currentStep: number; totalSteps: number; percentage: number } {
    const totalSteps = 14; // Approximate total number of pipeline steps (removed redundant updateJavaPackageDeclarations)
    const currentStep = this.steps.length;
    const percentage = Math.round((currentStep / totalSteps) * 100);

    return { currentStep, totalSteps, percentage };
  }

  /**
   * Get formatted pipeline status
   */
  getSummary(): string {
    const { percentage } = this.getProgress();
    const successfulSteps = this.steps.filter(s => s.success).length;
    const failedSteps = this.steps.filter(s => !s.success).length;

    let summary = `Pipeline Progress: ${percentage}% (${successfulSteps}/${this.steps.length} steps completed)`;

    if (failedSteps > 0) {
      summary += ` - ${failedSteps} steps failed`;
    }

    if (this.steps.length > 0) {
      const lastStep = this.steps[this.steps.length - 1];
      if (lastStep) {
        summary += `\nLast step: ${lastStep.step} (${lastStep.success ? 'SUCCESS' : 'FAILED'})`;
        if (lastStep.error) {
          summary += `\nError: ${lastStep.error}`;
        }
      }
    }

    return summary;
  }
}

/**
 * Convenience function to run pipeline without creating an instance
 */
export async function runPipeline(mod: Mod, options: PipelineOptions = {}): Promise<PipelineResult> {
  const runner = new PipelineRunner();
  return runner.runPipeline(mod, options);
}

/**
 * Create a mod object from CLI arguments for headless mode
 */
export function createModFromArgs(args: any, destinationPath: string): Mod {
  // Generate mod ID from name if not provided
  const modId = args.id || generateModId(args.name || 'mod');

  return {
    name: args.name || 'Untitled Mod',
    author: args.author || 'Unknown Author',
    id: modId,
    description: args.description || '',
    package: args.package || `${args.author?.toLowerCase().replace(/\s+/g, '.') || 'unknown'}.${modId}`,
    version: '1.0.0',
    javaVersion: args.javaVersion || '21',
    minecraftVersion: args.minecraft || '1.21.10',
    loaders: args.loaders ? args.loaders.split(',').map((s: string) => s.trim()) : ['fabric'],
    libraries: args.libraries ? args.libraries.split(',').map((s: string) => s.trim()) : [],
    mods: args.mods ? args.mods.split(',').map((s: string) => s.trim()) : [],
    samples: [],
    postActions: ['git-init', 'run-gradle'],
    license: args.license || 'mit',
    destinationPath
  };
}

/**
 * Generate a mod ID from a name (simple slugification)
 */
function generateModId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^[^a-z]/, '') // Remove leading non-letters
    .replace(/[^a-z0-9]*$/, '') // Remove trailing non-alphanumeric
    .replace(/[^a-z0-9]/g, '') // Clean up any remaining invalid chars
    || 'mod'; // Provide fallback
}