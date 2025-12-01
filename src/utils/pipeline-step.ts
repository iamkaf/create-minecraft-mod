import { spinner } from "@clack/prompts";

/**
 * Execute an operation with standardized spinner UI and error handling
 * Replaces 34+ identical spinner try/catch blocks
 */
export async function withSpinner<T>(
  startMessage: string,
  operation: () => Promise<T>,
  successMessage?: string
): Promise<T> {
  const s = spinner();
  s.start(startMessage);

  try {
    const result = await operation();
    // If operation returns a string and no custom success message provided, use the result
    if (typeof result === 'string' && !successMessage) {
      s.stop(result);
    } else {
      s.stop(successMessage || 'Operation completed successfully');
    }
    return result;
  } catch (error) {
    s.stop('Operation failed', 1);
    throw error;
  }
}

/**
 * Execute an operation with progress update capability
 */
export async function withProgressSpinner<T>(
  startMessage: string,
  operation: (update: (msg: string) => void) => Promise<T>
): Promise<T> {
  const s = spinner();
  s.start(startMessage);

  try {
    const result = await operation((msg) => s.message(msg));
    s.stop('Operation completed successfully');
    return result;
  } catch (error) {
    s.stop('Operation failed', 1);
    throw error;
  }
}