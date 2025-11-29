import type { Mod } from './types.js';
import type { PipelineResult } from './pipeline-runner.js';

/**
 * Structured result data for CI/CD integration
 */
export interface ModCreationResult {
  success: boolean;
  mod: {
    name: string;
    author: string;
    id: string;
    version: string;
    package: string;
    minecraftVersion: string;
    javaVersion: string;
    destinationPath: string;
  };
  options: {
    loaders: string[];
    libraries: string[];
    utility: string[];
    license: string;
    postActions: string[];
  };
  execution: {
    duration: number;
    startTime: Date;
    endTime: Date;
    steps: StepResult[];
    outputFormat: 'json' | 'text';
  };
  paths: {
    projectRoot: string;
    mainClass: string;
    gradleWrapper: string;
    buildGradle: string;
    configPath?: string;
  };
  error?: string;
}

export interface StepResult {
  step: string;
  success: boolean;
  duration: number;
  error?: string;
  timestamp: Date;
}

/**
 * Result reporter for different output formats
 */
export class ResultReporter {
  private startTime: Date;

  constructor(private mod: Mod) {
    this.startTime = new Date();
  }

  /**
   * Generate a comprehensive result object
   */
  generateResult(pipelineResult: PipelineResult, options: { configPath?: string; outputFormat?: 'json' | 'text' } = {}): ModCreationResult {
    const endTime = new Date();

    const result: ModCreationResult = {
      success: pipelineResult.success,
      mod: {
        name: this.mod.name,
        author: this.mod.author,
        id: this.mod.id,
        version: this.mod.version,
        package: this.mod.package,
        minecraftVersion: this.mod.minecraftVersion,
        javaVersion: this.mod.javaVersion,
        destinationPath: this.mod.destinationPath
      },
      options: {
        loaders: this.mod.loaders,
        libraries: this.mod.libraries,
        utility: this.mod.mods,
        license: this.mod.license,
        postActions: this.mod.postActions
      },
      execution: {
        duration: pipelineResult.duration,
        startTime: this.startTime,
        endTime,
        steps: pipelineResult.steps.map((step, index) => {
          const stepResult: StepResult = {
            step: step.step,
            success: step.success,
            duration: step.duration,
            timestamp: new Date(this.startTime.getTime() + index * 1000) // Simplified timestamp
          };
          if (step.error !== undefined) {
            stepResult.error = step.error;
          }
          return stepResult;
        }),
        outputFormat: options.outputFormat || 'text'
      },
      paths: {
        projectRoot: this.mod.destinationPath,
        mainClass: `${this.mod.package}.${this.mod.id.charAt(0).toUpperCase() + this.mod.id.slice(1)}Mod`,
        gradleWrapper: `${this.mod.destinationPath}/gradlew`,
        buildGradle: `${this.mod.destinationPath}/build.gradle`
      }
    };

    if (options.configPath) {
      result.paths.configPath = options.configPath;
    }

    if (pipelineResult.error) {
      result.error = pipelineResult.error;
    }

    return result;
  }

  /**
   * Output result in JSON format (for CI/CD)
   */
  outputJson(result: ModCreationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Output result in human-readable text format
   */
  outputText(result: ModCreationResult): string {
    const lines: string[] = [];

    // Header
    lines.push('='.repeat(60));
    lines.push('MINECRAFT MOD CREATION RESULT');
    lines.push('='.repeat(60));

    // Success status
    const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
    lines.push(`Status: ${status}`);
    lines.push('');

    // Mod information
    lines.push('MOD INFORMATION');
    lines.push('-'.repeat(30));
    lines.push(`Name: ${result.mod.name}`);
    lines.push(`Author: ${result.mod.author}`);
    lines.push(`ID: ${result.mod.id}`);
    lines.push(`Version: ${result.mod.version}`);
    lines.push(`Minecraft: ${result.mod.minecraftVersion}`);
    lines.push(`Java: ${result.mod.javaVersion}`);
    lines.push(`License: ${result.options.license}`);
    lines.push(`Package: ${result.mod.package}`);
    lines.push(`Destination: ${result.mod.destinationPath}`);
    lines.push('');

    // Configuration
    lines.push('CONFIGURATION');
    lines.push('-'.repeat(30));
    lines.push(`Loaders: ${result.options.loaders.join(', ')}`);
    lines.push(`Libraries: ${result.options.libraries.join(', ') || 'None'}`);
    lines.push(`Utility Mods: ${result.options.utility.join(', ') || 'None'}`);
    lines.push(`Post Actions: ${result.options.postActions.join(', ') || 'None'}`);
    lines.push('');

    // Execution summary
    lines.push('EXECUTION SUMMARY');
    lines.push('-'.repeat(30));
    lines.push(`Duration: ${(result.execution.duration / 1000).toFixed(2)}s`);
    lines.push(`Started: ${result.execution.startTime.toISOString()}`);
    lines.push(`Completed: ${result.execution.endTime.toISOString()}`);
    lines.push(`Steps: ${result.execution.steps.length}`);

    // Step details
    const successfulSteps = result.execution.steps.filter(s => s.success).length;
    const failedSteps = result.execution.steps.filter(s => !s.success).length;

    lines.push(`  Successful: ${successfulSteps}`);
    if (failedSteps > 0) {
      lines.push(`  Failed: ${failedSteps}`);
    }

    lines.push('');

    // Failed steps details
    if (failedSteps > 0) {
      lines.push('FAILED STEPS');
      lines.push('-'.repeat(30));
      for (const step of result.execution.steps.filter(s => !s.success)) {
        lines.push(`❌ ${step.step}`);
        if (step.error) {
          lines.push(`   Error: ${step.error}`);
        }
        lines.push(`   Duration: ${(step.duration / 1000).toFixed(2)}s`);
        lines.push('');
      }
    }

    // Success steps summary
    if (successfulSteps > 0) {
      lines.push('SUCCESSFUL STEPS');
      lines.push('-'.repeat(30));
      for (const step of result.execution.steps.filter(s => s.success)) {
        lines.push(`✅ ${step.step} (${(step.duration / 1000).toFixed(2)}s)`);
      }
      lines.push('');
    }

    // Paths
    lines.push('GENERATED PATHS');
    lines.push('-'.repeat(30));
    lines.push(`Project Root: ${result.paths.projectRoot}`);
    lines.push(`Main Class: ${result.paths.mainClass}`);
    lines.push(`Gradle Wrapper: ${result.paths.gradleWrapper}`);
    lines.push(`Build File: ${result.paths.buildGradle}`);
    if (result.paths.configPath) {
      lines.push(`Config File: ${result.paths.configPath}`);
    }
    lines.push('');

    // Error details if applicable
    if (result.error) {
      lines.push('ERROR DETAILS');
      lines.push('-'.repeat(30));
      lines.push(`${result.error}`);
      lines.push('');
    }

    // Footer
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * Output result in concise summary format
   */
  outputSummary(result: ModCreationResult): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push(`✅ Created mod "${result.mod.name}" successfully`);
      lines.push(`   Location: ${result.mod.destinationPath}`);
      lines.push(`   Loaders: ${result.options.loaders.join(', ')}`);
      lines.push(`   Duration: ${(result.execution.duration / 1000).toFixed(2)}s`);
    } else {
      lines.push(`❌ Failed to create mod "${result.mod.name}"`);
      lines.push(`   Error: ${result.error || 'Unknown error'}`);
      lines.push(`   Duration: ${(result.execution.duration / 1000).toFixed(2)}s`);
    }

    return lines.join('\n');
  }

  /**
   * Output result and handle different formats
   */
  report(pipelineResult: PipelineResult, options: { configPath?: string; outputFormat?: 'json' | 'text'; summary?: boolean } = {}): void {
    const result = this.generateResult(pipelineResult, options);
    const format = options.outputFormat || 'text';

    if (options.summary) {
      console.log(this.outputSummary(result));
    } else if (format === 'json') {
      console.log(this.outputJson(result));
    } else {
      console.log(this.outputText(result));
    }
  }
}

/**
 * Convenience function to create and use a result reporter
 */
export function createReporter(mod: Mod): ResultReporter {
  return new ResultReporter(mod);
}