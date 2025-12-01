import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withSpinner, withProgressSpinner } from '../pipeline-step.js';

// Mock @clack/prompts spinner
const mockSpinner = {
  start: vi.fn(),
  stop: vi.fn(),
  message: vi.fn()
};

vi.mock('@clack/prompts', () => ({
  spinner: () => mockSpinner
}));

describe('pipeline-step utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withSpinner', () => {
    it('executes operation and shows success message', async () => {
      const mockOperation = vi.fn().mockResolvedValue('test result');
      const result = await withSpinner('Starting operation...', mockOperation, 'Operation completed');

      expect(mockSpinner.start).toHaveBeenCalledWith('Starting operation...');
      expect(mockOperation).toHaveBeenCalled();
      expect(mockSpinner.stop).toHaveBeenCalledWith('Operation completed');
      expect(result).toBe('test result');
    });

    it('uses returned string as success message when none provided', async () => {
      const mockOperation = vi.fn().mockResolvedValue('test result');
      await withSpinner('Starting operation...', mockOperation);

      expect(mockSpinner.stop).toHaveBeenCalledWith('test result');
    });

    it('uses default success message when non-string returned', async () => {
      const mockOperation = vi.fn().mockResolvedValue(undefined);
      await withSpinner('Starting operation...', mockOperation);

      expect(mockSpinner.stop).toHaveBeenCalledWith('Operation completed successfully');
    });

    it('handles operation errors correctly', async () => {
      const error = new Error('Operation failed');
      const mockOperation = vi.fn().mockRejectedValue(error);

      await expect(withSpinner('Starting operation...', mockOperation)).rejects.toThrow(error);
      expect(mockSpinner.start).toHaveBeenCalledWith('Starting operation...');
      expect(mockSpinner.stop).toHaveBeenCalledWith('Operation failed', 1);
    });

    it('preserves original error object', async () => {
      const error = new Error('Original error message');
      error.stack = 'Error stack trace';
      const mockOperation = vi.fn().mockRejectedValue(error);

      try {
        await withSpinner('Test operation', mockOperation);
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBe(error);
        expect((e as Error).message).toBe('Original error message');
        expect((e as Error).stack).toBe('Error stack trace');
      }
    });

    it('handles string errors correctly', async () => {
      const mockOperation = vi.fn().mockRejectedValue('String error message');

      try {
        await withSpinner('Test operation', mockOperation);
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBe('String error message');
      }
    });

    it('handles null/undefined errors correctly', async () => {
      const mockOperation = vi.fn().mockRejectedValue(null);

      try {
        await withSpinner('Test operation', mockOperation);
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(String(e)).toContain('null');
      }
    });

    it('returns operation result unchanged', async () => {
      const testResults = [
        'string result',
        42,
        { data: 'object' },
        ['array', 'result'],
        null,
        undefined
      ];

      for (const expected of testResults) {
        const mockOperation = vi.fn().mockResolvedValue(expected);
        const result = await withSpinner('Test operation', mockOperation);
        expect(result).toBe(expected);
      }
    });
  });

  describe('withProgressSpinner', () => {
    it('executes operation with progress updates', async () => {
      const progressMessages: string[] = [];
      const mockOperation = vi.fn().mockImplementation(async (update) => {
        update('Step 1');
        await new Promise(resolve => setTimeout(resolve, 10));
        update('Step 2');
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'final result';
      });

      const result = await withProgressSpinner('Starting operation...', mockOperation);

      expect(mockSpinner.start).toHaveBeenCalledWith('Starting operation...');
      expect(mockOperation).toHaveBeenCalled();
      expect(mockSpinner.message).toHaveBeenCalledWith('Step 1');
      expect(mockSpinner.message).toHaveBeenCalledWith('Step 2');
      expect(mockSpinner.stop).toHaveBeenCalledWith('Operation completed successfully');
      expect(result).toBe('final result');
    });

    it('handles errors in progress operation correctly', async () => {
      const error = new Error('Progress operation failed');
      const mockOperation = vi.fn().mockImplementation(async (update) => {
        update('Starting...');
        throw error;
      });

      await expect(withProgressSpinner('Test operation', mockOperation)).rejects.toThrow(error);
      expect(mockSpinner.start).toHaveBeenCalledWith('Test operation');
      expect(mockSpinner.stop).toHaveBeenCalledWith('Operation failed', 1);
    });

    it('calls update function with provided messages', async () => {
      const updateCalls: string[] = [];
      const mockOperation = vi.fn().mockImplementation(async (update) => {
        update('First update');
        update('Second update');
        update('Final update');
        return 'done';
      });

      // Mock the spinner.message to capture calls
      mockSpinner.message.mockImplementation((message: string) => {
        updateCalls.push(message);
      });

      await withProgressSpinner('Test operation', mockOperation);

      expect(updateCalls).toEqual(['First update', 'Second update', 'Final update']);
    });

    it('returns operation result unchanged', async () => {
      const testResults = [
        'string result',
        42,
        { data: 'object' },
        ['array', 'result']
      ];

      for (const expected of testResults) {
        const mockOperation = vi.fn().mockImplementation(async () => expected);
        const result = await withProgressSpinner('Test operation', mockOperation);
        expect(result).toBe(expected);
      }
    });

    it('handles operations without progress updates', async () => {
      const mockOperation = vi.fn().mockResolvedValue('no progress result');

      const result = await withProgressSpinner('Test operation', mockOperation);

      expect(result).toBe('no progress result');
      expect(mockSpinner.message).not.toHaveBeenCalled();
    });

    it('preserves original error object during progress operation', async () => {
      const error = new Error('Progress error message');
      error.stack = 'Progress stack trace';
      const mockOperation = vi.fn().mockImplementation(async () => {
        throw error;
      });

      try {
        await withProgressSpinner('Test operation', mockOperation);
        expect.fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBe(error);
        expect((e as Error).message).toBe('Progress error message');
        expect((e as Error).stack).toBe('Progress stack trace');
      }
    });
  });
});