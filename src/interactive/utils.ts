/**
 * Utility functions for interactive mode
 */

import { isCancel, cancel } from "@clack/prompts";

/**
 * Handle user cancellation consistently across all prompts
 */
export function handleCancellation(message: string = "Operation cancelled."): never {
	cancel(message);
	process.exit(0);
}

/**
 * Validate that a result is not cancelled and convert to string
 */
export function validateResult(result: unknown): string {
	if (isCancel(result)) {
		handleCancellation();
	}
	return String(result);
}

/**
 * Validate that a result is not cancelled and convert to string array
 */
export function validateResults(result: unknown): string[] {
	if (isCancel(result)) {
		handleCancellation();
	}
	return result as string[];
}