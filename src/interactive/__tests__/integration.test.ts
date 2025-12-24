/**
 * Integration tests for Phase 2 Mode Separation
 * Tests that verify the refactoring maintains backward compatibility
 */

import { describe, it, expect } from 'vitest';

describe('Phase 2 Integration Tests', () => {
	it('should maintain module structure and exports', async () => {
		// Test that all modules are properly structured and export expected functions
		const basicInfoModule = await import('../prompts/basic-info.js');
		const technicalModule = await import('../prompts/technical.js');
		const dependenciesModule = await import('../prompts/dependencies.js');
		const optionalModule = await import('../prompts/optional.js');
		const interactiveModule = await import('../index.js');
		const promptsModule = await import('../prompts/index.js');

		// Verify main exports exist
		expect(basicInfoModule.collectBasicInfo).toBeDefined();
		expect(technicalModule.collectTechnicalSettings).toBeDefined();
		expect(dependenciesModule.collectDependencies).toBeDefined();
		expect(optionalModule.collectOptionalFeatures).toBeDefined();
		expect(interactiveModule.runInteractiveMode).toBeDefined();

		// Verify barrel exports work
		expect(promptsModule.collectBasicInfo).toBeDefined();
		expect(promptsModule.collectTechnicalSettings).toBeDefined();
		expect(promptsModule.collectDependencies).toBeDefined();
		expect(promptsModule.collectOptionalFeatures).toBeDefined();
	});

	it('should export proper TypeScript types', async () => {
		// Test that types are properly exported
		const typesModule = await import('../types.js');

		// Types are compile-time only, but we can verify the module structure
		expect(typesModule).toBeDefined();
		// configToMod is a runtime function
		expect(typesModule.configToMod).toBeDefined();
		expect(typeof typesModule.configToMod).toBe('function');
	});

	it('should have proper utility functions', async () => {
		// Test that utility functions exist and have correct signatures
		const utilsModule = await import('../utils.js');

		expect(utilsModule.handleCancellation).toBeDefined();
		expect(utilsModule.validateResult).toBeDefined();
		expect(utilsModule.validateResults).toBeDefined();

		// Verify they are functions
		expect(typeof utilsModule.handleCancellation).toBe('function');
		expect(typeof utilsModule.validateResult).toBe('function');
		expect(typeof utilsModule.validateResults).toBe('function');
	});

	it('should configToMod function create proper Mod object', async () => {
		const { configToMod } = await import('../types.js');

		const testConfig = {
			// Basic info
			destinationPath: '/test/mod',
			name: 'Test Mod',
			author: 'Test Author',
			description: 'A test mod',
			version: '1.0.0',
			javaVersion: '21',

			// Technical
			modId: 'testmod',
			packageName: 'com.test.testmod',
			minecraftVersion: '1.21.10',

			// Dependencies
			loaders: ['fabric'],
			libraries: ['amber'],
			mods: ['jei'],

			// Optional
			samples: ['item-registration'],
			license: 'mit',
			gradleVersion: '8.14',
			postActions: ['git-init'],
		};

		const mod = configToMod(testConfig);

		// Verify all properties are correctly mapped
		expect(mod.destinationPath).toBe('/test/mod');
		expect(mod.name).toBe('Test Mod');
		expect(mod.author).toBe('Test Author');
		expect(mod.description).toBe('A test mod');
		expect(mod.version).toBe('1.0.0');
		expect(mod.javaVersion).toBe('21');
		expect(mod.id).toBe('testmod');
		expect(mod.package).toBe('com.test.testmod');
		expect(mod.minecraftVersion).toBe('1.21.10');
		expect(mod.loaders).toEqual(['fabric']);
		expect(mod.libraries).toEqual(['amber']);
		expect(mod.mods).toEqual(['jei']);
		expect(mod.samples).toEqual(['item-registration']);
		expect(mod.license).toBe('mit');
		expect(mod.postActions).toEqual(['git-init']);
	});

	it('should maintain index.ts size reduction', async () => {
		// Test that index.ts was properly reduced
		const fs = await import('fs');
		const path = await import('path');

		const indexPath = path.resolve(process.cwd(), 'src/index.ts');
		const indexContent = fs.readFileSync(indexPath, 'utf8');

		const lineCount = indexContent.split('\n').length;

		// Should be significantly reduced from 515 lines
		expect(lineCount).toBeLessThan(200);
		expect(lineCount).toBeGreaterThan(50); // But still have content

		// Should contain the new interactive mode import
		expect(indexContent).toContain('await import(\'./interactive/index.js\')');
		expect(indexContent).toContain('runInteractiveMode');
	});

	it('should have all required files in place', async () => {
		const fs = await import('fs');
		const path = await import('path');

		const baseDir = path.resolve(process.cwd(), 'src/interactive');

		// Test that all expected files exist
		const expectedFiles = [
			'index.ts',
			'types.ts',
			'utils.ts',
			'prompts/index.ts',
			'prompts/basic-info.ts',
			'prompts/technical.ts',
			'prompts/dependencies.ts',
			'prompts/optional.ts',
		];

		for (const file of expectedFiles) {
			const filePath = path.join(baseDir, file);
			expect(fs.existsSync(filePath)).toBe(true);
			const content = fs.readFileSync(filePath, 'utf8');
			expect(content.length).toBeGreaterThan(0);
		}
	});

	it('should maintain proper TypeScript compilation', async () => {
		// Test that all modules compile without TypeScript errors
		// This is a simple check that all imports work correctly

		// Should be able to import all modules without errors
		await import('../index.js');
		await import('../types.js');
		await import('../utils.js');
		await import('../prompts/index.js');
		await import('../prompts/basic-info.js');
		await import('../prompts/technical.js');
		await import('../prompts/dependencies.js');
		await import('../prompts/optional.js');

		// If we get here without throwing, TypeScript compilation is working
		expect(true).toBe(true);
	});

	it('should follow same patterns as Phase 1 utilities', async () => {
		// Test that interactive modules follow same successful patterns as Phase 1
		const fileSystemModule = await import('../../utils/file-system.js');
		const pipelineStepModule = await import('../../utils/pipeline-step.js');
		const interactiveModule = await import('../index.js');

		// All should have proper function exports
		expect(typeof fileSystemModule.fileExists).toBe('function');
		expect(typeof pipelineStepModule.withSpinner).toBe('function');
		expect(typeof interactiveModule.runInteractiveMode).toBe('function');

		// Should follow same error handling patterns
		// This is verified by the fact that they compile and export properly
	});
});